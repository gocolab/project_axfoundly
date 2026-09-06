import "dotenv/config";
import { MongoClient, type Db } from "mongodb";
import { buildSeedData } from "../server/seeds/seedData.js";
import type { DatabaseSchema } from "../server/db.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mahaumaster:!Mahaumaster2515@localhost:27017/?authSource=admin";
const MONGODB_DBNAME =
  process.env.MONGODB_DBNAME ||
  (process.env.NODE_ENV === "production" ? "ax_foundly_pro" : "ax_foundly_dev");

// 보존 대상 회원 이메일
const PRESERVED_MEMBER_EMAILS = ["otter.oh@gmail.com", "mahau.master@gmail.com"];

// 단일 객체 문서 컬렉션
const SINGLETON_KEYS: Array<keyof DatabaseSchema> = ["stats"];

async function resetAndSeedDatabase() {
  console.log("===============================================================");
  console.log("🚀 [AX Foundly] 초기 데이터베이스 리셋 및 시딩 스크립트 시작");
  console.log(`🔗 Target MongoDB: ${MONGODB_URI}`);
  console.log(`📦 Database Name : ${MONGODB_DBNAME}`);
  console.log("===============================================================\n");

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    console.log("✅ MongoDB 연결 성공!\n");
    const mongodb: Db = client.db(MONGODB_DBNAME);

    const seedData = buildSeedData();

    // 1. codeGroups & commonCodes 점검 및 보존
    console.log("📌 [1/4] 공통 코드 (codeGroups & commonCodes) 무결성 점검...");
    const codeGroupsCol = mongodb.collection("codeGroups");
    const commonCodesCol = mongodb.collection("commonCodes");

    const codeGroupCount = await codeGroupsCol.countDocuments();
    const commonCodeCount = await commonCodesCol.countDocuments();

    if (codeGroupCount === 0) {
      await codeGroupsCol.insertMany(seedData.codeGroups as any[]);
      console.log(`  - codeGroups 초기 생성: ${seedData.codeGroups.length}건 삽입`);
    } else {
      console.log(`  - codeGroups 기존 유지: ${codeGroupCount}건 보존`);
    }

    if (commonCodeCount === 0) {
      await commonCodesCol.insertMany(seedData.commonCodes as any[]);
      console.log(`  - commonCodes 초기 생성: ${seedData.commonCodes.length}건 삽입`);
    } else {
      console.log(`  - commonCodes 기존 유지: ${commonCodeCount}건 보존`);
    }

    // 2. members 점검 및 보존 대상 회원 + 신규 가상 회원 동기화
    console.log("\n📌 [2/4] 회원 데이터 (members) 동기화...");
    const membersCol = mongodb.collection("members");
    const existingMembers = (await membersCol.find({}).toArray()) as any[];

    // 보존 대상 기존 계정 백업
    const preservedAccounts: any[] = [];
    for (const email of PRESERVED_MEMBER_EMAILS) {
      const found = existingMembers.find((m) => m.email === email);
      if (found) {
        preservedAccounts.push(found);
      }
    }

    // 새 시드 데이터의 필수 계정 및 가상회원 준비
    const newMembersMap = new Map<string, any>();
    for (const m of seedData.members) {
      newMembersMap.set(m.email, m);
    }

    // 기존에 존재하던 보존 계정이 있으면 기존 고유 ID나 생성일 유지하되 최신 상태 보정
    for (const preserved of preservedAccounts) {
      const seedVersion = newMembersMap.get(preserved.email);
      newMembersMap.set(preserved.email, {
        ...seedVersion,
        ...preserved,
        roles: seedVersion?.roles || preserved.roles || ["admin", "member"],
        status: "활성",
      });
    }

    // 컬렉션 초기화 후 새 회원 리스트 주입
    await membersCol.deleteMany({});
    const finalMembers = Array.from(newMembersMap.values()).map(({ _id, ...rest }) => rest);
    await membersCol.insertMany(finalMembers);
    console.log(`  - 필수 회원 보존 대상 (${PRESERVED_MEMBER_EMAILS.join(", ")}) 정상 유지`);
    console.log(`  - 총 ${finalMembers.length}명의 회원 (필수 2명 + 가상 회원 30명) 동기화 완료`);

    // 3. 주요 비즈니스 컬렉션 리셋 및 신규 현실성 데이터 시딩
    console.log("\n📌 [3/4] 주요 비즈니스 데이터 초기화 및 신규 시딩 주입...");
    const targetCollections: Array<keyof DatabaseSchema> = [
      "courses",
      "courseStudents",
      "courseRequests",
      "courseProposals",
      "irProjects",
      "ideaRequests",
      "ideaProposals",
      "posts",
      "comments",
      "notifications",
      "notificationPreferences",
      "notificationTemplates",
      "notificationLogs",
      "teamRequests",
      "payments",
      "settlements",
      "proposals",
      "recommendations",
      "stats",
      "boards",
      "crmMessages",
    ];

    for (const key of targetCollections) {
      const colName = String(key);
      const col = mongodb.collection(colName);
      await col.deleteMany({});

      if (SINGLETON_KEYS.includes(key)) {
        await col.insertOne({ _singleton: true, ...(seedData[key] as object) });
        console.log(`  - [${colName}] 단일 도큐먼트 갱신 완료`);
      } else {
        const arr = seedData[key] as unknown[];
        if (arr && arr.length > 0) {
          await col.insertMany(arr as any[]);
          console.log(`  - [${colName}] ${arr.length}건 시드 데이터 주입 완료`);
        } else {
          console.log(`  - [${colName}] 0건 (클린업 완료)`);
        }
      }
    }

    // 4. 최종 데이터베이스 상태 검증 보고
    console.log("\n📌 [4/4] 데이터베이스 초기화 및 시딩 완료 요약");
    console.log("---------------------------------------------------------------");
    const allCollections = await mongodb.listCollections().toArray();
    for (const colInfo of allCollections) {
      const count = await mongodb.collection(colInfo.name).countDocuments();
      console.log(`  ✔ 컬렉션 '${colInfo.name.padEnd(24)}': ${String(count).padStart(4)} docs`);
    }
    console.log("---------------------------------------------------------------");
    console.log("🎉 모든 데이터베이스 설정 및 시딩 작업이 성공적으로 완료되었습니다!\n");
  } catch (err: any) {
    console.error("❌ MongoDB 초기화 중 에러 발생:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetAndSeedDatabase();
