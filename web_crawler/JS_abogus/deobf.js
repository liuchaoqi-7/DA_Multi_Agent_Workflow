import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { generate } from '@babel/generator';
import t from "@babel/types"


class Deobf {
  constructor(funcName, varName, filePath, outPath) {
    this._funcName = funcName;
    this._varName = varName;
    this._filePath = filePath;
    this._outPath = outPath;
    this._code = fs.readFileSync(this._filePath, 'utf-8');
    this._ast = parse(this._code, {
      sourceType: 'module',
    })
  }

  _getCodeFromNode(node) {
    return this._code.slice(node.start, node.end);
  }

  _matchCondition(node, varName) {
    if (!t.isIfStatement(node) && !t.isConditionalExpression(node))
      return undefined;

    const test = node.test;

    function _isComparator(operator) {
      return ["===", "==", "!=", "!==", "<", "<=", ">", ">="].includes(operator);
    }

    if (!t.isBinaryExpression(test) || !_isComparator(test.operator))
      return undefined;

    function _isMatchIdentifier(n) {
      return t.isIdentifier(n) && n.name === varName;
    }

    const left = test.left;
    const right = test.right;

    if (t.isNumericLiteral(left) && _isMatchIdentifier(right)) {
      return {
        op: test.operator,
        index: left.extra.rawValue,
        varName: right.name,
      }
    } else if (t.isNumericLiteral(right) && _isMatchIdentifier(left)) {
      return {
        op: test.operator,
        index: right.extra.rawValue,
        varName: left.name,
      }
    }

    return undefined;
  }

  _nodeExists(node) {
    return node !== undefined && node !== null;
  }

  _induction() {
    if (!Object.prototype.getDataRecursively) {
      Object.prototype.getDataRecursively = function(key) {
        const data = this.getData(key);
        if (data !== undefined)
          return data;
        if (this.parentPath)
          return this.parentPath.getDataRecursively(key);
        return undefined;
      }
    }

    let keyFunction = undefined;
    let firstKeyPath = undefined;
    const mapping = {}
    const deferredPaths = [];
    const that = this;

    function _processBranch(path) {
      const isKeyPath = path.scope.getDataRecursively("isKeyPath");
      if (!isKeyPath)
        return;

      if (firstKeyPath === undefined)
        firstKeyPath = path;

      path.setData("isKeyPath", isKeyPath);
      const condition = that._matchCondition(path.node, that._varName);
      if (condition) {
        const dbgInfo = `${condition.varName} ${condition.op} ${condition.index}`;
        let info = path.getDataRecursively("info");
        if (info === undefined) {
          info = {
            start: 0,
            end: NaN,
            isLeaf: true,
            dbgInfo: "",
            left: undefined
          }
          path.setData("info", info);
        }

        info.isLeaf = false;

        if (t.isConditionalExpression(path.node)) {
          const parent = path.parent;
          if (t.isAssignmentExpression(parent)) {
            info.left = parent.left;
          }
        }

        let contNode = path.node.consequent;
        let altNode = undefined;

        if (that._nodeExists(path.node.alternate)) {
          altNode = path.node.alternate;
        } else {
          const parentBody = path.parent.body;
          const selfIndex = parentBody.indexOf(path.node);
          if (parentBody.length !== 2 || selfIndex !== 0) {
            throw Error("unexpected branch");
          }
          const candidateNode = parentBody[1];
          if (!that._matchCondition(candidateNode, that._varName)) {
            altNode = parentBody[1];
          }
        }

        let contInfo = undefined;
        let altInfo = undefined;

        function _spawnInfo() {
          return { ...info, isLeaf: true };
        }

        if (condition.op === "===" || condition.op === "==") {
          mapping[condition.index] = {
            left: info.left,
            node: contNode,
          };
          altInfo = _spawnInfo();
          path.get("consequent").skip();
        } else if (condition.op === "!==" || condition.op === "!=") {
          mapping[condition.index] = {
            left: info.left,
            node: altNode,
          };
          contInfo = _spawnInfo();
          path.get("alternate").skip();
        } else {
          contInfo = _spawnInfo();
          altInfo = _spawnInfo();

          if (condition.op === "<") {
            // Update range.
            contInfo.end = Number.isNaN(info.end)
              ? condition.index
              : Math.min(condition.index, info.end);

            contInfo.dbgInfo += ` ${that._varName} < ${condition.index}`;

            altInfo.start = Number.isNaN(info.start)
              ? condition.index
              : Math.max(condition.index, info.start);

            altInfo.dbgInfo += ` ${that._varName} >= ${condition.index}`;
          } else {
            throw Error("unknown opcode");
          }
        }

        function _createDeferredPath(node, info) {
          return {
            node: node,
            info: info,
            isSolved: false,
            indexSet: undefined
          }
        }

        if (contInfo !== undefined && contNode !== undefined) {
          deferredPaths.push(_createDeferredPath(contNode, contInfo));
          path.get("consequent").setData("info", contInfo);
        }

        if (altInfo !== undefined && altNode !== undefined) {
          deferredPaths.push(_createDeferredPath(altNode, altInfo));
          path.get("alternate").setData("info", altInfo);
        }

      }
    }

    traverse.default(this._ast, {
      FunctionDeclaration: (path) => {
        if (path.node.id.name === "d") {
          path.scope.setData("isKeyPath", true);
          keyFunction = path.node;
        }
      },
      ConditionalExpression: (path) => {
        _processBranch(path);
      },
      IfStatement: (path) => {
        _processBranch(path);
      },
    });

    const solvedIndexes = new Set(Object.keys(mapping).map(x => parseInt(x)));
    const worklist = deferredPaths.filter(x => x.info.isLeaf);
    let updated = true;
    while (updated) {
      updated = false;

      // console.log("===================== round start")
      // Solve until convergent.
      for (let i = worklist.length - 1; i >= 0; i--) {
        const {node, info} = worklist[i];
        if (info.isSolved) continue;

        if (!Number.isNaN(info.start) && !Number.isNaN(info.end)) {
          if (info.indexSet === undefined) {
            // Init the index set with range.
            info.indexSet = new Set(Array.from(
              { length: info.end - info.start },
              (_, j) => info.start + j)
            );
          }
          info.indexSet = info.indexSet.difference(solvedIndexes);

          // If the path only has one index, it's solved.
          if (info.indexSet.size === 1) {
            info.isSolved = true;

            const [firstIndex] = info.indexSet;
            mapping[firstIndex] = {
              left: info.left,
              node: node,
            };

            solvedIndexes.add(firstIndex);
            updated = true;
          }

        }

      } // end for ...

    } // end while ...

    const others = worklist.filter(x => !x.info.isSolved);

    if (others.length > 1) {
      throw new Error("too many unsolved paths");
    } else if (others.length === 1) {
      const maxIndex = Math.max(...Array.from(solvedIndexes));
      if (others[0].info.start === maxIndex) {
        mapping[maxIndex + 1] = {
          left: others[0].info.left,
          node: others[0].node,
        };
      } else {
        throw new Error("Can not solve the last path.");
      }
    }

    // Create a swtich node.
    const cases = [];
    Object.entries(mapping).forEach(([k, v]) => {
      const index = parseInt(k);
      const {left, node} = v;

      let statement = undefined;

      if (left !== undefined) {
        statement = t.expressionStatement(
          t.assignmentExpression("=", left, node)
        )
      } else if (t.isExpression(node)) {
        statement = t.expressionStatement(node)
      } else if (t.isStatement(node)) {
        statement = node;
      } else {
        throw new Error("unexpected node type");
      }

      const cont = [statement];
      if (!this._hasTerminator(statement))
        cont.push(t.breakStatement());

      cases.push(
        t.switchCase(t.numericLiteral(index), cont)
      )
    });

    const switzh = t.switchStatement(t.identifier(this._varName), cases);
    firstKeyPath.replaceWith(switzh);
  }

  _hasTerminator(node) {
    if (node.body && Array.isArray(node.body)) {
      for (const child of node.body) {
        if (this._hasTerminator(child)) return true;
      }
    }

    return t.isReturnStatement(node) ||
      t.isThrowStatement(node) ||
      t.isBreakStatement(node) ||
      t.isContinueStatement(node);
  }

  run() {
    this._induction();
    if (this._outPath === undefined)
      return;

    const { code: newCode } = generate(this._ast, { /* options */ });
    fs.writeFileSync(this._outPath, newCode, { encoding: 'utf-8' });
  }

}

function main() {
  const args = process.argv.slice(2);
  const [funcName, varName, inFile, outFile] = args;
  if (funcName === undefined || varName === undefined || inFile === undefined) {
    console.log("Usage: node deobf.js <funcName> <varName> <inFile> [outFile]");
    return;
  }
  const de = new Deobf(funcName, varName, inFile, outFile);
  de.run();
}

main();