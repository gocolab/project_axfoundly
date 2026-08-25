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
    
    // members 컬렉션 마이그레이션
    const membersCollection = db.collection("members");
    const members = await membersCollection.find({}).toArray();
    
    let updatedCount = 0;
    for (const member of members) {
      const updateDoc: any = {};
      const unsetDoc: any = {};

      if (member.role && typeof member.role === "string") {
        updateDoc.roles = member.role === "admin" ? ["admin"] : member.role === "manager" ? ["manager"] : ["member"];
        unsetDoc.role = "";
      } else if (!member.roles || !Array.isArray(member.roles)) {
        updateDoc.roles = member.email === "admin@platform.com" || member.email === "otter.oh@gmail.com" ? ["admin"] : ["member"];
      }

      // Sync assignedRoles for known seed accounts if missing
      if (!member.assignedRoles || member.assignedRoles.length === 0) {
        if (member.email === "sohyun.kim@mail.com" || member.email === "ws.jung@mail.com" || member.email === "ms.kang@mail.com") {
          updateDoc.assignedRoles = ["course_instructor"];
        } else if (member.email === "sw.han@nexusvc.com") {
          updateDoc.assignedRoles = ["investor_active"];
        }
      }

      if (Object.keys(updateDoc).length > 0 || Object.keys(unsetDoc).length > 0) {
        const updateOp: any = {};
        if (Object.keys(updateDoc).length > 0) updateOp.$set = updateDoc;
        if (Object.keys(unsetDoc).length > 0) updateOp.$unset = unsetDoc;
        await membersCollection.updateOne({ _id: member._id }, updateOp);
        updatedCount++;
      }
    }
    
    console.log(`Migrated ${updatedCount} members to use 'roles' array and proper assignedRoles.`);

    // comments 컬렉션 마이그레이션 (authorRole -> authorRoles)
    const commentsCollection = db.collection("comments");
    const comments = await commentsCollection.find({ authorRole: { $exists: true } }).toArray();

    let commentsUpdated = 0;
    for (const comment of comments) {
      if (comment.authorRole && typeof comment.authorRole === "string") {
        await commentsCollection.updateOne(
          { _id: comment._id },
          {
            $set: { authorRoles: [comment.authorRole] },
            $unset: { authorRole: "" }
          }
        );
        commentsUpdated++;
      }
    }

    console.log(`Migrated ${commentsUpdated} comments to use 'authorRoles' array.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

main();
