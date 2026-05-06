export type Message = {
  id: string
  from: 'user' | 'bot'
  text: string
  time: number
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
}

export type Profile = {
  name: string
  bio?: string
}
