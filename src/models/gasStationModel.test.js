jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const gasStationModel = require("./gasStationModel");

afterEach(() => {
  jest.clearAllMocks();
});

describe("upsertMany", () => {
  it("returns 0 without querying when records is empty", async () => {
    const result = await gasStationModel.upsertMany([]);

    expect(result).toBe(0);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("upserts records and returns affectedRows", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 2 }]);
    const records = [
      { objectId: 1, adresse: "Test 1", longitude: 6.9, latitude: 50.9 },
      { objectId: 2, adresse: "Test 2", longitude: 6.8, latitude: 50.8 },
    ];

    const result = await gasStationModel.upsertMany(records);

    expect(result).toBe(2);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO stations"), [
      [
        [1, "Test 1", 6.9, 50.9],
        [2, "Test 2", 6.8, 50.8],
      ],
    ]);
  });
});

describe("findAll", () => {
  it("returns all rows", async () => {
    const rows = [{ objectId: 1, adresse: "Test 1", longitude: 6.9, latitude: 50.9 }];
    pool.query.mockResolvedValue([rows]);

    const result = await gasStationModel.findAll();

    expect(result).toBe(rows);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("FROM stations ORDER BY object_id"));
  });
});

describe("findById", () => {
  it("returns the matching row", async () => {
    const row = { objectId: 1, adresse: "Test 1", longitude: 6.9, latitude: 50.9 };
    pool.query.mockResolvedValue([[row]]);

    const result = await gasStationModel.findById(1);

    expect(result).toBe(row);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE object_id = ?"), [1]);
  });

  it("returns null when no row matches", async () => {
    pool.query.mockResolvedValue([[]]);

    const result = await gasStationModel.findById(9999);

    expect(result).toBeNull();
  });
});

describe("findNextObjectId", () => {
  it("returns maxObjectId + 1", async () => {
    pool.query.mockResolvedValue([[{ maxObjectId: 5 }]]);

    const result = await gasStationModel.findNextObjectId();

    expect(result).toBe(6);
  });

  it("returns 1 when the table is empty", async () => {
    pool.query.mockResolvedValue([[{ maxObjectId: null }]]);

    const result = await gasStationModel.findNextObjectId();

    expect(result).toBe(1);
  });
});

describe("insert", () => {
  it("inserts the record with the given fields", async () => {
    pool.query.mockResolvedValue([{}]);

    await gasStationModel.insert({ objectId: 3, adresse: "Test 3", longitude: 6.7, latitude: 50.7 });

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO stations"), [
      3,
      "Test 3",
      6.7,
      50.7,
    ]);
  });
});

describe("update", () => {
  it("returns affectedRows on success", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await gasStationModel.update(1, { adresse: "Updated", longitude: 6.6, latitude: 50.6 });

    expect(result).toBe(1);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE stations SET"), [
      "Updated",
      6.6,
      50.6,
      1,
    ]);
  });

  it("returns 0 when no row matches", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await gasStationModel.update(999, { adresse: "Updated", longitude: 6.6, latitude: 50.6 });

    expect(result).toBe(0);
  });
});

describe("remove", () => {
  it("returns affectedRows on success", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await gasStationModel.remove(1);

    expect(result).toBe(1);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM stations"), [1]);
  });

  it("returns 0 when no row matches", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await gasStationModel.remove(999);

    expect(result).toBe(0);
  });
});
