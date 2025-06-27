import { describe, it, expect, vi } from "vitest";
import * as exportService from "./export.service";
import xlsx from "node-xlsx";
import fs from "fs/promises";


vi.mock("node-xlsx", () => ({
  default: {
    build: vi.fn().mockReturnValue(Buffer.from("fake-xlsx")),
  },
}));
vi.mock("fs/promises", () => ({
  default: {
    writeFile: vi.fn(),
  },
}));

describe("createExport", () => {
  it("should call xlsx.build with valid data and write the file", async () => {
    const transfers = [
      { sourceAccountId: 1, destAccountId: 2, amount: 100 },
      { sourceAccountId: 1, destAccountId: 4, amount: 200 },
    ];
    const filePath = "test.xlsx";
    const fakeBuffer = Buffer.from("fake-xlsx");


    await exportService.createExport(transfers, filePath);

    expect(xlsx.build).toBeCalledTimes(1);
    expect(xlsx.build).toBeCalledWith([
      {
        name: "Transfers",
        data: [
          ["SourceAccountId", "DestAccountId", "Amount"],
          [1, 2, 100],
          [1, 4, 200],
        ],
      },
    ]);
    expect(fs.writeFile).toBeCalledWith(filePath, fakeBuffer);
    expect(fs.writeFile).toBeCalledTimes(1);
    expect(fs.writeFile).toBeCalledWith(filePath, fakeBuffer);

  });
});
