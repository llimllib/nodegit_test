import nodegit from "nodegit";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const fileName = "newfile.txt";
const fileContent = "hello world";

const Git = nodegit;

const main = async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "foo-"));
  console.log(dir);
  const repo = await nodegit.Repository.init(dir, 0);
  await fs.promises.writeFile(path.join(repo.workdir(), fileName), fileContent);
  const index = await repo.refreshIndex();
  await index.addByPath(fileName);
  await index.write();

  const oid = await index.writeTree();

  const author = nodegit.Signature.now("Scott Chacon", "schacon@gmail.com");
  const committer = nodegit.Signature.now("Scott A Chacon", "scott@github.com");

  // Since we're creating an initial commit, it has no parents. Note that unlike
  // normal we don't get the head either, because there isn't one yet.
  const commitId = await repo.createCommit(
    "HEAD",
    author,
    committer,
    "message",
    oid,
    [],
  );

  const c = await repo.getHeadCommit();
  const tree = await c.getTree();
  const tb = await Git.Treebuilder.create(repo, tree);
  const tb2 = await Git.Treebuilder.create(repo, null);
  const oid2 = await tb2.write();
  const newTreeEntry = await tb.insert(
    "mynewfolder",
    oid2,
    Git.TreeEntry.FILEMODE.TREE,
  );
  console.log(newTreeEntry.isTree(), "should be true");
  return Git.Tree.lookup(repo, newTreeEntry.oid());
};
await main();
