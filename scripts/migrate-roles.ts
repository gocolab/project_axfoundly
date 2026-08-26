import "dotenv/config";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mahaumaster:!Mahaumaster2515@localhost:27017/?authSource=admin";
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "launch_bizs_dev";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DBNAME);
    
    // ── 1. members 컬렉션 roles 마이그레이션 ──
    const membersCollection = db.collection("members");
    const members = await membersCollection.find({}).toArray();
    
    console.log(`총 ${members.length}명의 회원 문서를 검사합니다...`);
    let updatedCount = 0;

    for (const member of members) {
      const email = (member.email || "").toLowerCase();
      const isAdmin =
        email === "admin@platform.com" ||
        email === "otter.oh@gmail.com";

      // 목표 roles: admin 이메일만 ["admin"], 나머지는 무조건 ["member"]
      const targetRoles = isAdmin ? ["admin"] : ["member"];

      const updateDoc: Record<string, any> = {};
      const unsetDoc: Record<string, any> = {};

      // roles 정규화
      const currentRolesStr = JSON.stringify(member.roles || []);
      const targetRolesStr = JSON.stringify(targetRoles);
      if (currentRolesStr !== targetRolesStr) {
        updateDoc.roles = targetRoles;
      }

      // 과거 잔재 필드 제거
      if (member.role !== undefined) unsetDoc.role = "";
      if (member.assignedRoles !== undefined) unsetDoc.assignedRoles = "";
      if (member.userAssignedRoles !== undefined) unsetDoc.userAssignedRoles = "";

      if (Object.keys(updateDoc).length > 0 || Object.keys(unsetDoc).length > 0) {
        const updateOp: Record<string, any> = {};
        if (Object.keys(updateDoc).length > 0) updateOp.$set = updateDoc;
        if (Object.keys(unsetDoc).length > 0) updateOp.$unset = unsetDoc;

        await membersCollection.updateOne({ _id: member._id }, updateOp);
        updatedCount++;
      }
    }
    
    console.log(`✅ ${updatedCount}명의 회원 문서가 최신 roles(["member" | "admin"]) 규격으로 갱신되었습니다.`);

    // ── 2. comments 컬렉션 authorRoles 마이그레이션 ──
    const commentsCollection = db.collection("comments");
    const comments = await commentsCollection.find({}).toArray();
    let commentsUpdated = 0;

    for (const comment of comments) {
      const unsetDoc: Record<string, any> = {};
      const setDoc: Record<string, any> = {};

      if (comment.authorRole !== undefined) {
        unsetDoc.authorRole = "";
        if (!comment.authorRoles) {
          setDoc.authorRoles = [comment.authorRole === "admin" ? "admin" : "member"];
        }
      }

      if (Object.keys(setDoc).length > 0 || Object.keys(unsetDoc).length > 0) {
        const updateOp: Record<string, any> = {};
        if (Object.keys(setDoc).length > 0) updateOp.$set = setDoc;
        if (Object.keys(unsetDoc).length > 0) updateOp.$unset = unsetDoc;

        await commentsCollection.updateOne({ _id: comment._id }, updateOp);
        commentsUpdated++;
      }
    }

    if (commentsUpdated > 0) {
      console.log(`✅ ${commentsUpdated}개의 댓글 문서가 authorRoles 규격으로 갱신되었습니다.`);
    }

    // ── 3. 마이그레이션 후 최종 members 현황 출력 ──
    const finalMembers = await membersCollection
      .find({})
      .project({ name: 1, email: 1, roles: 1, status: 1 })
      .toArray();

    console.log("\n📋 [MongoDB members 컬렉션 최종 상태]");
    console.table(
      finalMembers.map((m) => ({
        ID: m._id.toString().slice(-6),
        이름: m.name,
        이메일: m.email,
        Roles: JSON.stringify(m.roles),
        상태: m.status,
      }))
    );

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
  }
}

main();
