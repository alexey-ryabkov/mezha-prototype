export type Role = "owner" | "manager"

export const VILLAGE = {
  name: "Ольховый ручей",
  site: "olhovy-ruchey.ru",
}

export const SUPPORT_EMAIL = "support@mezha.app"

export const USERS: Record<Role, { name: string; fullName: string; email: string; title: string }> = {
  owner: {
    name: "Андрей",
    fullName: "Андрей Соколов",
    email: "andrey@olhovy-ruchey.ru",
    title: "Собственник",
  },
  manager: {
    name: "Ольга",
    fullName: "Ольга Миронова",
    email: "olga@olhovy-ruchey.ru",
    title: "Менеджер по продажам",
  },
}
