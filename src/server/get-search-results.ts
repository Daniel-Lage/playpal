// "use server";
// import { eq, desc, and, sql, ilike } from "drizzle-orm";
// import { type PostObject } from "~/models/post.model";
// import { db } from "./db";
// import { repliesTable, postsTable } from "./db/schema";

// export async function getSearchResults(
//   searchQuery: string,
//   lastQueried?: Date,
// ) {
//   const posts = await db.query.postsTable.findMany({
//     with: {
//       author: true,
//       likes: true,
//       replies: {
//         // only gets direct replies
//         where: eq(repliesTable.separation, 0),
//       },
//     },
//     orderBy: [desc(postsTable.createdAt)],
//     where: and(
//       ilike(postsTable.content, `%${searchQuery}%`),
//       lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new posts
//     ),
//     limit: 100,
//   });

//   const users = await db.query.usersTable.findFirst({
//       where: eq(usersTable.id, userId),
//       with: {
//         followers: { with: { follower: true } },
//       },
//     });
//   const user = await db.query.usersTable.findFirst({
//       where: eq(usersTable.id, userId),
//       with: {
//         posts: {
//           with: {
//             author: true,
//             likes: true,
//             replies: {
//               // only gets direct replies
//               where: eq(repliesTable.separation, 0),
//             },
//           },
//         },
//         likes: {
//           with: {
//             likee: {
//               with: {
//                 author: true,
//                 likes: true,
//                 replies: {
//                   // only gets direct replies
//                   where: eq(repliesTable.separation, 0),
//                 },
//               },
//             },
//           },
//         },
//         followers: true,
//         following: true,
//       },
//     });

//   const users
// }
