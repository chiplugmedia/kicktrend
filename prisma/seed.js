const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@wanblog.internal",
      password: hashedPassword,
      role: "admin",
    },
  });

  // 2. Create Regular Registered Users
  const user1 = await prisma.user.create({
    data: {
      username: "alex_dev",
      email: "alex@wanblog.internal",
      password: hashedPassword,
      role: "user",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "elena_design",
      email: "elena@wanblog.internal",
      password: hashedPassword,
      role: "user",
    },
  });

  // 3. Create Sample Blog Posts
  const post1 = await prisma.post.create({
    data: {
      title: "The Architecture of Extreme Simplicity",
      slug: "architecture-of-extreme-simplicity",
      summary: "Why stripping away decorative chrome, color overload, and gratuitous micro-interactions unlocks unprecedented clarity and performance.",
      content: `In an era of hyper-saturated gradients, 3D floating meshes, and cognitive overload, restraint has become the ultimate differentiator.

## The Cognitive Cost of Visual Noise

Every saturated hue, unnecessary shadow, and heavy drop blur places a tax on user attention. When we strip an interface back to high-contrast monochrome values—deep carbon blacks and unadulterated whites—we force both the designer and the engineer to confront the essentials:
- **Typography hierarchy:** Font weight and leading must carry the weight of meaning.
- **Spatial composition:** Whitespace stops being 'empty' and becomes active structural breathing room.
- **Information velocity:** The user's eye scans without visual friction or deceptive cues.

### Engineering Discipline in Restraint

Building a monochrome aesthetic isn't just about CSS tokens. It extends to network payloads and rendering pipelines. With fewer assets and zero heavy gradient canvases:
\`\`\`ts
// Strict monochrome tokens in Tailwind
const palette = {
  bg: '#000000',
  surface: '#0a0a0a',
  border: '#27272a',
  text: '#fafafa',
};
\`\`\`

When performance and design align, speed becomes the brand. Every millisecond saved during first contentful paint directly correlates with reader retention.`,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Design",
      tags: "design,minimalism,performance,architecture",
      hashtags: "#design #minimalism #architecture",
      readTime: 4,
      published: true,
      authorUsername: admin.username,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Zero-Latency Edge Data Fetching with Prisma & SQLite",
      slug: "zero-latency-edge-fetching-prisma",
      summary: "Exploring server action pipelines, single-query relational loading, and predictable caching strategies in Next.js 15.",
      content: `Modern full-stack web applications no longer need monolithic REST APIs or bloated GraphQL clients for internal page hydration.

## Server Actions as First-Class RPCs

Next.js App Router combined with Prisma transforms the way we interact with relational databases:
1. **Type Safety End-to-End:** Client components call strongly typed functions.
2. **Atomic Invalidation:** \`revalidatePath\` guarantees fresh cache without manual state synchronization.
3. **Database Proximity:** Whether running SQLite at the edge or PostgreSQL in distributed clusters, queries resolve in sub-millisecond windows.

### Practical Implementation

Here is how we link relational models cleanly through username keys:
\`\`\`prisma
model Like {
  id             String @id @default(cuid())
  postId         String
  authorUsername String
  author         User   @relation(fields: [authorUsername], references: [username])

  @@unique([postId, authorUsername])
}
\`\`\`

By binding directly to the unique \`username\`, every like and comment is intrinsically attributed without redundant join tables.`,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      videoUrl: null,
      category: "Engineering",
      tags: "nextjs,prisma,sqlite,typescript,database",
      hashtags: "#technology #engineering #nextjs #typescript",
      readTime: 5,
      published: true,
      authorUsername: admin.username,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "The Art of Monochrome Digital Typography",
      slug: "art-of-monochrome-digital-typography",
      summary: "A practical guide to optical font sizes, rhythm, and monospace contrast in editorial web publications.",
      content: `When color is removed from an editorial canvas, typography must work ten times harder.

## Vertical Rhythm and Line Height

For long-form reading, line length must strictly stay between 60 to 75 characters per line (approx. 68ch to 75ch). Any wider causes tracking fatigue; any narrower fragments sentence momentum.

### Monospace as an Accent

Pairing a clean sans-serif editorial typeface with crisp monospace subheadings creates immediate architectural structure. It evokes technical documentation, precision, and unadorned truth.`,
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
      videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
      category: "Architecture",
      tags: "typography,editorial,craft,css",
      hashtags: "#typography #design #minimalism",
      readTime: 3,
      published: true,
      authorUsername: admin.username,
    },
  });

  // 4. Create Pre-seeded Likes and Comments
  await prisma.like.create({
    data: {
      postId: post1.id,
      authorUsername: user1.username,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      authorUsername: user2.username,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      authorUsername: user1.username,
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorUsername: user1.username,
      content: "This minimalist philosophy is exactly what the modern web is missing. The typography rhythm here is phenomenal.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorUsername: user2.username,
      content: "Agreed. Restraint creates distinction. Loved the video inclusion too!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorUsername: admin.username,
      content: "Feel free to check out the admin console to publish your own articles!",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("👤 Admin: username='admin' | password='password123'");
  console.log("👤 User:  username='alex_dev' | password='password123'");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
