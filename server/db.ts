import "dotenv/config";
import { MongoClient, type Db, type Collection } from "mongodb";
import type {
  Course,
  CourseStudent,
  IRProject,
  BoardPost,
  Comment,
  Notification,
  TeamBuildingRequest,
  PaymentRecord,
  SettlementRecord,
  InvestmentProposal,
  AIRecommendation,
  DashboardStats,
  AdminMember,
  AdminBoard,
  CRMMessage,
  JobApplication,
  UserRole,
  CodeGroup,
  CommonCode,
  CourseRequest,
  CourseProposal,
  IdeaRequest,
  IdeaProposal,
  NotificationPreference,
  NotificationTemplate,
  NotificationLog,
  InstructorProfile,
} from "../src/types";

export interface DatabaseSchema {
  courses: Course[];
  instructors: InstructorProfile[];
  courseStudents: CourseStudent[];
  courseRequests: CourseRequest[];
  courseProposals: CourseProposal[];
  irProjects: IRProject[];
  ideaRequests: IdeaRequest[];
  ideaProposals: IdeaProposal[];
  posts: BoardPost[];
  comments: Comment[];
  notifications: Notification[];
  notificationPreferences: NotificationPreference[];
  notificationTemplates: NotificationTemplate[];
  notificationLogs: NotificationLog[];
  teamRequests: TeamBuildingRequest[];
  payments: PaymentRecord[];
  settlements: SettlementRecord[];
  proposals: InvestmentProposal[];
  recommendations: AIRecommendation[];
  stats: DashboardStats;
  members: AdminMember[];
  boards: AdminBoard[];
  crmMessages: CRMMessage[];
  applications: JobApplication[];
  codeGroups: CodeGroup[];
  commonCodes: CommonCode[];
  kakao_sessions: Array<{
    tid: string;
    orderId: string;
    userId: string;
    itemName: string;
    totalAmount: number;
  }>;
}

// ──────────────────────── MongoDB 연결 설정 ────────────────────────

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mahaumaster:!Mahaumaster2515@localhost:27017/?authSource=admin";
const MONGODB_DBNAME =
  process.env.MONGODB_DBNAME ||
  (process.env.NODE_ENV === "production" ? "ax_foundly_pro" : "ax_foundly_dev");

let client: MongoClient;
let mongodb: Db;

// (Seed Data는 server/seeds/seedData.ts로 모듈화 분리됨)

// ──────────────────────── Database Class (MongoDB 기반) ────────────────────────

// stats는 단일 문서이므로 별도 처리가 필요한 키 목록
const SINGLETON_KEYS: Array<keyof DatabaseSchema> = ["stats"];

function getDocumentPrimaryKey(item: any): string | null {
  if (!item || typeof item !== "object") return null;
  if ("id" in item && item.id != null) return "id";
  if ("userId" in item && item.userId != null) return "userId";
  if ("groupCode" in item && item.groupCode != null) return "groupCode";
  if ("tid" in item && item.tid != null) return "tid";
  return null;
}

function createEmptySchema(): DatabaseSchema {
  return {
    courses: [],
    instructors: [],
    courseStudents: [],
    courseRequests: [],
    courseProposals: [],
    irProjects: [],
    ideaRequests: [],
    ideaProposals: [],
    posts: [],
    comments: [],
    notifications: [],
    notificationPreferences: [],
    notificationTemplates: [],
    notificationLogs: [],
    teamRequests: [],
    payments: [],
    settlements: [],
    proposals: [],
    recommendations: [],
    stats: {
      dailySignups: 0,
      monthlySignups: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeCourses: 0,
      teamMatchCount: 0,
      investmentMatchCount: 0,
      courseRequestCount: 0,
      courseMatchRate: 0,
      ideaRequestCount: 0,
      builderMatchRate: 0,
      aiAutoFillCount: 0,
    },
    members: [],
    boards: [],
    crmMessages: [],
    applications: [],
    codeGroups: [],
    commonCodes: [],
    kakao_sessions: [],
  };
}

class Database {
  private cache: DatabaseSchema;
  private initialized = false;

  constructor() {
    // 서버 초기화 전 기본 빈 캐시로 시작 (자동 시딩 방지)
    this.cache = createEmptySchema();
  }

  /**
   * MongoDB 연결 및 데이터 로드.
   * 서버 시작 시 MongoDB에 존재하는 데이터를 순수 조회(Read-only)하여 캐시에 로드합니다.
   * (데이터 초기화 및 시딩은 오직 명시적 명령어 `npm run db:reset` 실행 시에만 동작합니다.)
   */
  async init(): Promise<void> {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      mongodb = client.db(MONGODB_DBNAME);
      console.log(`[DB] MongoDB connected: ${MONGODB_DBNAME}`);

      const keys: Array<keyof DatabaseSchema> = [
        "courses",
        "instructors",
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
        "members",
        "boards",
        "crmMessages",
        "applications",
        "codeGroups",
        "commonCodes",
        "kakao_sessions",
      ];

      for (const key of keys) {
        const collection = mongodb.collection(key);

        if (SINGLETON_KEYS.includes(key)) {
          const doc = await collection.findOne({ _singleton: true });
          if (doc) {
            const { _id, _singleton, ...rest } = doc as any;
            (this.cache as any)[key] = rest;
          } else {
            (this.cache as any)[key] = createEmptySchema()[key];
          }
        } else {
          const docs = await collection.find({}).toArray();
          const mappedDocs = docs.map((d: any) => {
            const { _id, ...rest } = d;
            if (key === "members") {
              const roles: UserRole[] = Array.isArray(rest.roles) && rest.roles.length > 0
                ? rest.roles
                : (rest.role === "admin" ? ["admin"] : rest.role === "manager" ? ["manager"] : ["member"]);
              return { ...rest, roles };
            }
            if (key === "comments") {
              const authorRoles: UserRole[] = Array.isArray(rest.authorRoles) && rest.authorRoles.length > 0
                ? rest.authorRoles
                : (rest.authorRole ? [rest.authorRole as UserRole] : ["member"]);
              return { ...rest, authorRoles };
            }
            return rest;
          });

          // 고유 ID / userId / groupCode 기준 중복 제거 방어
          const seen = new Set<string>();
          (this.cache as any)[key] = mappedDocs.filter((item: any) => {
            const uid = item?.id || item?.userId || item?.groupCode;
            if (uid) {
              if (seen.has(uid)) return false;
              seen.add(uid);
            }
            return true;
          });
        }
      }

      if (!this.cache.instructors || this.cache.instructors.length === 0) {
        const { buildSeedData } = await import("./seeds/seedData.js");
        this.cache.instructors = buildSeedData().instructors || [];
        if (this.cache.instructors.length > 0) {
          await this.syncToMongo("instructors");
        }
      }

      this.initialized = true;
      console.log("[DB] All collections loaded into cache from MongoDB");
    } catch (error) {
      console.error("[DB] MongoDB connection failed:", error);
      this.cache = createEmptySchema();
      this.initialized = true;
    }
  }

  /**
   * MongoDB 컬렉션에 캐시 내용을 안전하게 영속화 (Bulk Upsert & Cleanup)
   */
  private async syncToMongo<K extends keyof DatabaseSchema>(key: K): Promise<void> {
    if (!mongodb) return;

    try {
      const collection = mongodb.collection(key as string);

      if (SINGLETON_KEYS.includes(key)) {
        const value = this.cache[key];
        await collection.replaceOne(
          { _singleton: true },
          { _singleton: true, ...(value as object) },
          { upsert: true }
        );
      } else {
        const arr = ((this.cache[key] as unknown[]) || []).map((item: any) => {
          const { _id, ...rest } = item || {};
          return rest;
        });

        if (arr.length === 0) {
          await collection.deleteMany({});
          return;
        }

        // 고유 식별자가 있는 문서는 deleteMany 없이 안전하게 Bulk Upsert 수행하여 데이터 유실 및 빈 컬렉션 갭 차단
        const pk = getDocumentPrimaryKey(arr[0]);
        if (pk) {
          const operations = arr.map((item: any) => ({
            replaceOne: {
              filter: { [pk]: item[pk] },
              replacement: item,
              upsert: true,
            },
          }));

          await collection.bulkWrite(operations, { ordered: false });

          // 현재 캐시에 없는 삭제된 항목만 안전하게 정리
          const currentIds = arr.map((item: any) => item[pk]).filter(Boolean);
          if (currentIds.length > 0) {
            await collection.deleteMany({ [pk]: { $nin: currentIds } });
          }
        } else {
          await collection.deleteMany({});
          await collection.insertMany(arr);
        }
      }
    } catch (error) {
      console.error(`[DB] Failed to sync collection "${String(key)}" to MongoDB:`, error);
    }
  }

  public persist() {
    // 모든 컬렉션 동기화 (fire-and-forget)
    const keys = Object.keys(this.cache) as Array<keyof DatabaseSchema>;
    for (const key of keys) {
      this.syncToMongo(key);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.cache[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.cache[key] = value;
    this.syncToMongo(key);
  }

  public update<K extends keyof DatabaseSchema>(
    key: K,
    updater: (prev: DatabaseSchema[K]) => DatabaseSchema[K]
  ) {
    this.cache[key] = updater(this.cache[key]);
    this.syncToMongo(key);
    return this.cache[key];
  }
}

export const db = new Database();

/**
 * MongoDB 초기화 함수. 서버 시작 전에 반드시 호출.
 */
export async function initDb(): Promise<void> {
  await db.init();
}
