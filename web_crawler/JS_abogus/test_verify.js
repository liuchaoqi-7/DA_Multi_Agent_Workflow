import {BDMS} from "./abogus.js";

async function main() {
  const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
  const pageId = 9999;
  const appId = 6383;

  const queryParams = new URLSearchParams({
    'aid': appId.toString(),
    'browser_language': 'en-US',
    'browser_name': 'Chrome',
    'browser_online': 'true',
    'browser_platform': 'MacIntel',
    'browser_version': '110.0.0.0',
    'channel': 'channel_pc_web',
    'cookie_enabled': 'true',
    'count': '10',
    'cpu_core_num': '10',
    'device_memory': '8',
    'device_platform': 'webapp',
    'disable_rs': '0',
    'downlink': '10',
    'effective_type': '4g',
    'enable_history': '1',
    'engine_name': 'Blink',
    'engine_version': '110.0.0.0',
    'from_group_id': '',
    'is_filter_search': '0',
    'keyword': 'OMFG',
    'list_type': 'single',
    'msToken': 'zht2C8MZumTzrMHJ3WDVTQg_-eRmkCs_gNWerpA4XqqFCnBhHDw8XI05U0kt9Dg6-ae3jK_2jhF5ZPE9NOJw2sHbxV4MIGc72iYXmnxKKKGwhvc9a7DeoHrkkmMuV_FPDn9LP6dq5hB74N6svSnrzKMWGXMFlJYWY0-243_vLIoDi0O2KdSC5HE=',
    'need_filter_settings': '0',
    'offset': '10',
    'os_name': 'Mac OS',
    'os_version': '10.15.7',
    'pc_client_type': '1',
    'pc_libra_divert': 'Mac',
    'pc_search_top_1_params': '{"enable_ai_search_top_1":1}',
    'platform': 'PC',
    'query_correct_type': '1',
    'round_trip_time': '50',
    'screen_height': '1920',
    'screen_width': '1080',
    'search_channel': 'aweme_general',
    'search_id': '202512240935438BD18D1C5692BD5973E6',
    'search_source': 'normal_search',
    'support_dash': '1',
    'support_h265': '1',
    'update_version_code': '170400',
    'version_code': '190600',
    'version_name': '19.6.0',
    'webid': '85868838718989776235'
  });

  const qStr = queryParams.toString();
  const bdms = new BDMS(ua);
  
  // 生成 a_bogus
  const aBogus = bdms.calculateABogus(
    1,
    0,
    8,
    qStr,
    "",
    ua,
    pageId,
    appId,
    "1.0.1.19-fix.01"
  );

  console.log("生成的 a_bogus:", aBogus);
  console.log("a_bogus 长度:", aBogus.length);
  console.log("a_bogus 格式验证:", /^[A-Za-z0-9_-]+$/.test(aBogus) ? "有效" : "无效");
  
  queryParams.append("a_bogus", aBogus);
  const finalUrl = `https://compass.jinritemai.com/shop/chance/rank-talent?${queryParams.toString()}`;
  console.log("\n完整 URL:", finalUrl);
}

main().then();
