const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const touristSpotRoutes = require("./routes/touristSpotRoutes");
const tourRoutes = require("./routes/tourRoutes");
const authRoutes = require("./routes/authRoutes");
const travelRoutes = require("./routes/travel");
const recommendRoutes = require("./routes/recommendRoutes");

const { fetchTourData } = require("../scripts/fetchTourData");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/test", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tourist-spots", touristSpotRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api", recommendRoutes);

app.get("/fetch-gyeongbuk", async (req, res) => {
  try {
    await fetchTourData();
    res.json({ message: " 경상북도 관광지 저장 완료!" });
  } catch (error) {
    console.error("데이터 가져오기 실패:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/fetch-gyeongbuk2", async (req, res) => {
  try {
    await fetchTourData();
    res.json({ message: " 남은 경상북도 관광지 저장 완료!" });
  } catch (error) {
    console.error("데이터 가져오기 실패:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` 서버 실행 중: http://localhost:${PORT}`);
});

module.exports = app;
