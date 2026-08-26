import "dotenv/config";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mahaumaster:!Mahaumaster2515@localhost:27017/?authSource=admin";
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "launch_bizs_dev";

async function main() {
  console.log(`[DB] Connecting to MongoDB (${MONGODB_URI}, db: ${MONGODB_DBNAME})...`);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DBNAME);
    const membersCollection = db.collection("members");

    // 1. 김수강생 (student@mail.com) -> ["member"]
    const kimRes = await membersCollection.updateMany(
      {
        $or: [
          { name: "김수강생" },
          { email: { $regex: /^student@mail\.com$/i } }
        ]
      },
      {
        $set: { roles: ["member"] },
        $unset: { role: "", assignedRoles: "", userAssignedRoles: "" }
      }
    );
    console.log(`✅ [김수강생] 업데이트 완료 (${kimRes.modifiedCount || kimRes.matchedCount}건 매칭) -> roles: ["member"]`);

    // 2. 오승환 (otter.oh@gmail.com) -> ["admin", "member"]
    const ohRes = await membersCollection.updateMany(
      {
        $or: [
          { name: "오승환" },
          { email: { $regex: /^otter\.oh@gmail\.com$/i } }
        ]
      },
      {
        $set: { roles: ["admin", "member"] },
        $unset: { role: "", assignedRoles: "", userAssignedRoles: "" }
      }
    );
    console.log(`✅ [오승환] 업데이트 완료 (${ohRes.modifiedCount || ohRes.matchedCount}건 매칭) -> roles: ["admin", "member"]`);

    // 3. 현재 members 컬렉션 상태 조회 및 출력
    const targetMembers = await membersCollection
      .find({
        $or: [
          { name: { $in: ["김수강생", "오승환"] } },
          { email: { $in: ["student@mail.com", "otter.oh@gmail.com"] } }
        ]
      })
      .project({ _id: 1, id: 1, name: 1, email: 1, roles: 1, status: 1 })
      .toArray();

    console.log("\n📋 [MongoDB members 컬렉션 타깃 회원 최종 상태]");
    console.table(
      targetMembers.map((m) => ({
        ID: m.id || m._id.toString(),
        이름: m.name,
        이메일: m.email,
        Roles: JSON.stringify(m.roles),
        상태: m.status,
      }))
    );

    // 전체 members 목록도 확인
    const allMembers = await membersCollection
      .find({})
      .project({ name: 1, email: 1, roles: 1, status: 1 })
      .toArray();

    console.log(`\n📋 [MongoDB members 전체 목록 (총 ${allMembers.length}명)]`);
    console.table(
      allMembers.map((m) => ({
        이름: m.name,
        이메일: m.email,
        Roles: JSON.stringify(m.roles),
        상태: m.status,
      }))
    );
  } catch (error) {
    console.error("❌ DB update failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
