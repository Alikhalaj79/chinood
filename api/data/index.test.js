import { jest } from "@jest/globals";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test("calls mongoose.connect with MONGODB_URI from env", async () => {
  const connectMock = jest.fn().mockResolvedValue({});
  process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

  // mock mongoose as ESM default export
  jest.unstable_mockModule("mongoose", () => ({
    default: { connect: connectMock },
  }));

  // import the module after setting up the mocked mongoose
  const { connectDB } = await import("./index.js");
  await connectDB();

  expect(connectMock).toHaveBeenCalledTimes(1);
  expect(connectMock).toHaveBeenCalledWith(process.env.MONGODB_URI);
});

test("calls mongoose.connect even when MONGODB_URI is not set", async () => {
  const connectMock = jest.fn().mockResolvedValue({});
  delete process.env.MONGODB_URI;

  jest.unstable_mockModule("mongoose", () => ({
    default: { connect: connectMock },
  }));

  const { connectDB } = await import("./index.js");
  await connectDB();

  expect(connectMock).toHaveBeenCalledTimes(1);
  expect(connectMock).toHaveBeenCalledWith(undefined);
});
