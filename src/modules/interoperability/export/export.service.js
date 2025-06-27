import xlsx from "node-xlsx";
import fs from "fs/promises";

export async function createExport(transfers, filePath) {
  const data = [
    ["SourceAccountId", "DestAccountId", "Amount"],
    ...transfers.map(t => [t.sourceAccountId, t.destAccountId, t.amount])
  ];

  const buffer = xlsx.build([{ name: "Transfers", data }]);

  await fs.writeFile(filePath, buffer);
}