import os
import time
import random
import json
import requests
import pandas as pd
from sqlalchemy import create_engine,text
from openai import OpenAI
import whisper
import zhconv
from DrissionPage import ChromiumPage
from zai import ZhipuAiClient


# ================= 配置区域 =================
DB_URL = ""
SAVE_DIR = "/Volumes/新加卷/刘0204"
EXCEL_PATH = "douyin_videos.xlsx"
QWEN_API_KEY = ""


qwen_client = OpenAI(api_key=QWEN_API_KEY, base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")
zhipu_client = ZhipuAiClient(api_key="")  # 填写自己的 API Key

print("📦 正在初始化 Whisper (base)...")
asr_model = whisper.load_model("base")
# ===========================================

def get_qwen_timestamp_analysis(segments_text):
    """
    让千问处理带时间戳的文案：纠错、情感分析、卖点提炼
    """
    try:
        completion = qwen_client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "你是一个短视频营销专家。请对ASR文案进行以下处理：\n"
                        "1. 纠错：修正错别字，保留语气词和时间戳格式。\n"
                        "2. 情感分析：判断视频整体情绪（如：亢奋、真诚、焦虑等）。\n"
                        "3. 卖点提炼：总结视频中推荐图书的核心卖点（简短有力）。\n"
                        "请输出严格的JSON格式：\n"
                        "{'timeline': [{'time': '00:01', 'text': '内容'}], "
                        "'sentiment': '情感描述', 'key_selling_points': '卖点总结'}"
                    )
                },
                {"role": "user", "content": segments_text}
            ],
            # thinking={
            #     "type": "disabled",    # 启用深度思考模式
            #     "clear_thinking":"True"
            # },
            # max_tokens=65536,          # 最大输出 tokens
            # temperature=1.0,           # 控制输出的随机性
            extra_body={"enable_thinking": "false"},
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"❌ 千问深度分析失败: {e}")
        return None

def download_video(page, v_id, file_path):
    """抓取与物理下载视频 (保持稳健逻辑)"""
    page.listen.clear()
    page.get(f'https://www.douyin.com/video/{v_id}')
    res = page.listen.wait(timeout=10)
    if res and res.response.body:
        try:
            data = res.response.body
            if 'aweme_detail' not in data: return False
            video_url = data['aweme_detail']['video']['play_addr']['url_list'][0]
            cookies = {c['name']: c['value'] for c in page.cookies()}
            headers = {'User-Agent': page.user_agent, 'Referer': 'https://www.douyin.com/', 'Range': 'bytes=0-'}
            resp = requests.get(video_url, headers=headers, cookies=cookies, stream=True, timeout=30)
            if resp.status_code in [200, 206]:
                with open(file_path, 'wb') as f:
                    for chunk in resp.iter_content(chunk_size=1024*1024): f.write(chunk)
                return os.path.getsize(file_path) > 102400
        except Exception: pass
    return False

def process_tasks():
    if not os.path.exists(SAVE_DIR): os.makedirs(SAVE_DIR)
    engine = create_engine(DB_URL)
    sql ="""
        SELECT
        -- DISTINCT
        a.`视频ID`,
        CONCAT('www.douyin.com/video/', 视频ID) AS 视频地址,
        MAX(a.视频标题) 视频标题,
        MAX(a.日期) 日期,
        MAX(a.达人昵称) 达人昵称, MAX(a.`达人UID`) 达人UID,  MAX( a.`直播间ID`) 直播间ID, MAX(b.直播间标题) 直播间标题
        FROM ods.ods_内容榜_直播交易榜_视频_day2 a
        LEFT JOIN ods.ods_内容榜_直播交易榜_day2 b
        ON a.直播间ID = b.直播间ID
        WHERE a.视频地址!='' AND b.行业类目 LIKE '%书籍%'
        GROUP BY 1,2
        ORDER BY 5
    """
    
    df_db = pd.read_sql(text(sql), engine)

    if os.path.exists(EXCEL_PATH):
        df_excel = pd.read_excel(EXCEL_PATH)
        df_excel['视频ID'] = df_excel['视频ID'].astype(str)
    else:
        df_excel = pd.DataFrame()

    page = ChromiumPage(addr_or_opts='127.0.0.1:9223')
    page.listen.start('aweme/v1/web/aweme/detail')

    for index, row in df_db.iterrows():
        v_id = str(row['视频ID'])
        author = "".join([c for c in str(row['达人昵称']) if c.isalnum()])
        file_path = f"{SAVE_DIR}/{v_id}_{author}.mp4"

        # 如果已有时间戳文案且非失败状态，则跳过
        if not df_excel.empty and v_id in df_excel['视频ID'].values:
            exist_row = df_excel[df_excel['视频ID'] == v_id].iloc[0]
            if pd.notna(exist_row.get('修正文案')) and "失败" not in str(exist_row.get('修正文案')):
                continue

        print(f"\n🚀 正在处理 [{index+1}/{len(df_db)}]: {row['达人昵称']}")

        if not os.path.exists(file_path):
            if not download_video(page, v_id, file_path): 
                time.sleep(1) 
                continue

        try:
            # 1. 执行 Whisper 并获取 segments
            print("🎙️  提取带时间轴的原始语音...")
            result = asr_model.transcribe(file_path, language='zh', fp16=False)
            
            # 2. 格式化带时间戳的草稿给千问
            raw_segments = []
            for seg in result['segments']:
                start_time = time.strftime('%M:%S', time.gmtime(seg['start']))
                text_content = zhconv.convert(seg['text'], 'zh-cn')
                raw_segments.append(f"[{start_time}] {text_content}")
            
            segments_str = "\n".join(raw_segments)

            # 3. 调用千问进行“多维”分析
            print("🧠 智普正在进行深度分析（纠错+情感+卖点）...")
            analysis = get_qwen_timestamp_analysis(segments_str)
            
            if analysis:
                timeline_data = "\n".join([f"[{item['time']}] {item['text']}" for item in analysis.get('timeline', [])])
                sentiment = analysis.get('sentiment', '分析失败')
                selling_points = analysis.get('key_selling_points', '分析失败')
            else:
                timeline_data = "分析失败"
                sentiment = "分析失败"
                selling_points = "分析失败"

            # 4. 更新记录（增加新字段）
            record = {
                "直播间ID":str(row['直播间ID']),
                "直播间标题":row['直播间标题'],
                "视频ID": v_id,
                "达人昵称": row['达人昵称'],
                "视频标题": row['视频标题'],
                "ASR文案": result,
                "修正文案": timeline_data,
                "情感倾向": sentiment,        
                "核心卖点提炼": selling_points, 
                "更新时间": time.strftime("%Y-%m-%d %H:%M:%S")
            }    
            
            # DataFrame 增量更新逻辑
            if df_excel.empty:
                df_excel = pd.DataFrame([record])
            else:
                if v_id in df_excel['视频ID'].values:
                    idx = df_excel[df_excel['视频ID'] == v_id].index[0]
                    for k, v in record.items(): df_excel.at[idx, k] = v
                else:
                    df_excel = pd.concat([df_excel, pd.DataFrame([record])], ignore_index=True)
            
            df_excel.to_excel(EXCEL_PATH, index=False)
            print(f"✅ 已存入 Excel：包含 {len(raw_segments)} 段带时轴文案")

        except Exception as e:
            print(f"❌ 运行报错: {e}")
        time.sleep(random.uniform(5, 10))

    page.listen.stop()

if __name__ == "__main__":
    process_tasks()
