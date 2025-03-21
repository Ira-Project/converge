import { db } from "../..";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";


import json from "./ib-physics.json";

export async function createTopics() {
  // Parameters for assignment creation
  const topicList = []
  
  for (const t of json.topics) {

    const topicObject = t as { name: string, slug: string, description: string };

    // Check if topic already exists
    const existingTopic = await db.select().from(topics).where(
      eq(topics.name, topicObject.name),
    )

    if (existingTopic?.[0]) {
      console.log("Topic already exists. Skipping", topicObject.name)
      topicList.push(existingTopic[0])
      continue
    }

    const newTopicId = generateId(21);
    await db.insert(topics).values({
      id: newTopicId,
      name: topicObject.name,
      slug: topicObject.slug,
      description: topicObject.description,
    })

    topicList.push({
      id: newTopicId,
      name: topicObject.name,
      slug: topicObject.slug,
      description: topicObject.description,
    })
  }

  console.log("Topics created")
  console.log("--------------------------------")

  for (const t of topicList) {
    console.log(t.name, " - ", t.id)
  }
}