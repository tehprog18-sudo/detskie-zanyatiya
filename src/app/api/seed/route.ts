import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, programs, scheduleSlots, children, bookings, subscriptions, testDriveRequests } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Check if already seeded
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Данные уже загружены" });
    }

    const adminPass = await hashPassword("admin123");
    const parentPass = await hashPassword("parent123");

    // Create admin
    const [admin] = await db.insert(users).values({
      email: "admin@akademia-uma.ru",
      password: adminPass,
      name: "Администратор",
      phone: "+7 (999) 123-45-67",
      role: "admin",
    }).returning();

    // Create demo parents
    const [parent1] = await db.insert(users).values({
      email: "anna@example.com",
      password: parentPass,
      name: "Анна Петрова",
      phone: "+7 (916) 555-12-34",
      role: "parent",
    }).returning();

    const [parent2] = await db.insert(users).values({
      email: "maria@example.com",
      password: parentPass,
      name: "Мария Иванова",
      phone: "+7 (903) 777-89-01",
      role: "parent",
    }).returning();

    const [parent3] = await db.insert(users).values({
      email: "elena@example.com",
      password: parentPass,
      name: "Елена Сидорова",
      phone: "+7 (925) 333-45-67",
      role: "parent",
    }).returning();

    // Create children
    const [child1] = await db.insert(children).values({
      parentId: parent1.id, name: "Миша", birthDate: "2024-03-15", notes: "Любит строить башни",
    }).returning();
    const [child2] = await db.insert(children).values({
      parentId: parent2.id, name: "София", birthDate: "2024-06-20", notes: "Обожает музыку",
    }).returning();
    const [child3] = await db.insert(children).values({
      parentId: parent3.id, name: "Артём", birthDate: "2024-01-10",
    }).returning();
    await db.insert(children).values({
      parentId: parent1.id, name: "Алиса", birthDate: "2024-08-05", notes: "Двойняшка Миши",
    });

    // Create programs
    const programsData = [
      {
        name: "Маленький строитель",
        shortDescription: "Строим, исследуем, играем! Игровые зоны, развитие воображения и командная игра.",
        description: "Занятие «Маленький строитель» — это увлекательное путешествие в мир конструирования для малышей! Дети строят из мягких блоков, кубиков, природных материалов. Развиваем мелкую моторику, пространственное мышление и учимся работать в команде. Каждое занятие — новая тема: от домиков до мостов и замков!",
        price: 2500,
        emoji: "🏗️",
      },
      {
        name: "Грязное творчество",
        shortDescription: "Можно пачкаться, нельзя скучать! Краски, тесто, пена, вода и следы.",
        description: "«Грязное творчество» — это занятие, где малыши могут свободно экспериментировать с красками, тестом, пеной, водой и другими материалами. Мы рисуем руками и ногами, лепим, оставляем следы и отпечатки. Развиваем сенсорное восприятие, творческое мышление и просто получаем удовольствие от процесса!",
        price: 2500,
        emoji: "🎨",
      },
      {
        name: "Маленький повар",
        shortDescription: "Готовим, играем, развиваемся! Простые блюда и знакомство с продуктами.",
        description: "На занятии «Маленький повар» малыши готовят простые и полезные блюда вместе с родителями. Месим тесто, нарезаем фрукты безопасными ножами, украшаем печенье. Развиваем самостоятельность, мелкую моторику и знакомимся с полезными продуктами. Вкусно с пользой и радостью!",
        price: 2800,
        emoji: "👨‍🍳",
      },
      {
        name: "Музыкальный мир",
        shortDescription: "Играем, слушаем, двигаемся! Живые инструменты и развитие чувства ритма.",
        description: "«Музыкальный мир» — это занятие, где малыши знакомятся с музыкой через игру. Используем живые инструменты: барабаны, маракасы, ксилофон, бубен. Поём песни, танцуем, развиваем чувство ритма и слух. Музыка объединяет сердца родителей и малышей!",
        price: 2500,
        emoji: "🎵",
      },
      {
        name: "Мир на ощупь",
        shortDescription: "Трогаем, щупаем, исследуем! Сенсорные коробки и тактильные дорожки.",
        description: "Занятие «Мир на ощупь» — это погружение в мир сенсорных ощущений. Малыши исследуют сенсорные коробки с крупами, водой, песком, тактильные дорожки и массажные коврики. Развиваем осязание, координацию и познавательную активность.",
        price: 2500,
        emoji: "🤲",
      },
      {
        name: "Лаборатория малыша",
        shortDescription: "Эксперименты и открытия! Простые опыты с водой, светом и природными материалами.",
        description: "В «Лаборатории малыша» мы проводим простые и безопасные опыты: смешиваем цвета, наблюдаем за водой, исследуем магниты и свет. Каждое занятие — это маленькое научное открытие, которое развивает любознательность и наблюдательность малышей.",
        price: 2800,
        emoji: "🔬",
      },
      {
        name: "Первооткрыватель джунглей",
        shortDescription: "Приключение в джунглях! Полосы препятствий и знакомство с животными.",
        description: "«Первооткрыватель джунглей» — это активное занятие-приключение! Малыши проходят полосы препятствий, знакомятся с животными джунглей через игрушки и карточки, танцуют и играют в подвижные игры. Много движения, радости и новых знаний!",
        price: 2500,
        emoji: "🌿",
      },
      {
        name: "Первооткрыватель космоса",
        shortDescription: "Путешествие к звёздам! Ракеты, планеты и космические игры.",
        description: "На занятии «Первооткрыватель космоса» малыши отправляются в космическое путешествие! Строим ракеты, изучаем планеты, играем со звёздами и светом. Развиваем воображение, координацию движений и познаём мир вокруг нас.",
        price: 2500,
        emoji: "🚀",
      },
      {
        name: "Сенсорная комната",
        shortDescription: "Расслабление и исследование. Световые эффекты, мягкие материалы и спокойные игры.",
        description: "«Сенсорная комната» — это мягкое, спокойное занятие для малышей. Световые проекции, мягкие подушки, успокаивающая музыка и нежные тактильные материалы. Идеально для развития сенсорного восприятия и укрепления связи между родителем и ребёнком.",
        price: 2500,
        emoji: "✨",
      },
      {
        name: "Малыш и город",
        shortDescription: "Играем в город! Магазин, почта, транспорт и ролевые игры для малышей.",
        description: "На занятии «Малыш и город» мы создаём мини-город с магазином, почтой, транспортом и другими локациями. Малыши примеряют на себя разные роли, играют в ролевые игры, развивают речь и социальные навыки. Каждое занятие — новое путешествие по городу!",
        price: 2500,
        emoji: "🏙️",
      },
    ];

    const createdPrograms = [];
    for (const p of programsData) {
      const [prog] = await db.insert(programs).values({
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        duration: 120,
        maxSpots: 8,
        imageUrl: p.emoji,
      }).returning();
      createdPrograms.push(prog);
    }

    // Create schedule slots for next 2 weeks
    const today = new Date();
    const slotsToCreate = [];
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0) continue; // skip Sundays

      const dateStr = date.toISOString().split("T")[0];
      const programIndex = dayOffset % createdPrograms.length;
      
      slotsToCreate.push({
        programId: createdPrograms[programIndex].id,
        date: dateStr,
        startTime: "10:00",
        endTime: "12:00",
        maxSpots: 8,
        bookedSpots: Math.floor(Math.random() * 4),
      });

      if (dayOfWeek === 6 || dayOfWeek === 3) {
        const programIndex2 = (dayOffset + 3) % createdPrograms.length;
        slotsToCreate.push({
          programId: createdPrograms[programIndex2].id,
          date: dateStr,
          startTime: "14:00",
          endTime: "16:00",
          maxSpots: 8,
          bookedSpots: Math.floor(Math.random() * 3),
        });
      }
    }

    const createdSlots = [];
    for (const s of slotsToCreate) {
      const [slot] = await db.insert(scheduleSlots).values(s).returning();
      createdSlots.push(slot);
    }

    // Create some bookings
    if (createdSlots.length > 0) {
      await db.insert(bookings).values({
        userId: parent1.id,
        childId: child1.id,
        slotId: createdSlots[0].id,
        status: "confirmed",
      });
      if (createdSlots.length > 1) {
        await db.insert(bookings).values({
          userId: parent2.id,
          childId: child2.id,
          slotId: createdSlots[1].id,
          status: "confirmed",
        });
      }
    }

    // Create subscriptions
    await db.insert(subscriptions).values({
      userId: parent1.id,
      type: "pack4",
      totalClasses: 4,
      usedClasses: 1,
      price: 8000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    await db.insert(subscriptions).values({
      userId: parent2.id,
      type: "pack8",
      totalClasses: 8,
      usedClasses: 1,
      price: 14000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    // Create test drive requests
    await db.insert(testDriveRequests).values([
      { parentName: "Ольга Козлова", phone: "+7 (916) 444-55-66", childAge: "1 год 3 месяца", isProcessed: false },
      { parentName: "Наталья Волкова", phone: "+7 (903) 222-33-44", email: "natasha@mail.ru", childAge: "1 год 8 месяцев", isProcessed: true },
    ]);

    return NextResponse.json({ message: "Демо-данные успешно загружены!", counts: { programs: createdPrograms.length, slots: createdSlots.length } });
  } catch (e) {
    console.error("Seed error:", e);
    return NextResponse.json({ error: "Ошибка при загрузке данных" }, { status: 500 });
  }
}
