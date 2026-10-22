
export interface Player {
  id: string
  number: string
  name: string
  active: boolean
}

export interface Team {
  id: string
  name: string
  createdAt: string
  players: Player[]
}

export type GameStatus = 'scheduled' | 'in-progress' | 'completed'

export type GameEventType =
  | 'shot'
  | 'freeThrow'
  | 'assist'
  | 'block'
  | 'steal'
  | 'offensiveRebound'
  | 'defensiveRebound'
  | 'turnover'
  | 'foul'
  | 'substitution'
  | 'timeout'

export interface GameEvent {
  id: string
  type: GameEventType
  teamId: string
  playerId?: string
  relatedPlayerId?: string
  points?: number
  made?: boolean
  quarter: number
  createdAt: string
  cancelled?: boolean
}

export interface Game {
  id: string
  name: string
  homeTeamId: string
  awayTeamId: string
  homeUniform: 'white' | 'dark'
  awayUniform: 'white' | 'dark'
  status: GameStatus
  currentQuarter: number
  events: GameEvent[]
  homeLineup?: string[]
  awayLineup?: string[]
  createdAt: string
  updatedAt: string
}

const DB_NAME = 'team-link-basketball'
const DB_VERSION = 2
const TEAM_STORE = 'teams'
const GAME_STORE = 'games'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(TEAM_STORE)) {
        db.createObjectStore(TEAM_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(GAME_STORE)) {
        db.createObjectStore(GAME_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      reject(new Error('データベースの更新がブロックされました。ほかのタブを閉じてください。'))
    }
  })
}

export async function getTeams(): Promise<Team[]> {
  const db = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(TEAM_STORE, 'readonly')
      const request = transaction.objectStore(TEAM_STORE).getAll()

      request.onsuccess = () => resolve(request.result as Team[])
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function saveTeam(team: Team): Promise<void> {
  const db = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(TEAM_STORE, 'readwrite')
      transaction.objectStore(TEAM_STORE).put(team)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function deleteTeam(id: string): Promise<void> {
  const db = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(TEAM_STORE, 'readwrite')
      transaction.objectStore(TEAM_STORE).delete(id)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function getGames(): Promise<Game[]> {
  const db = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(GAME_STORE, 'readonly')
      const request = transaction.objectStore(GAME_STORE).getAll()

      request.onsuccess = () => resolve(request.result as Game[])
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function saveGame(game: Game): Promise<void> {
  const db = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(GAME_STORE, 'readwrite')
      transaction.objectStore(GAME_STORE).put(game)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function deleteGame(id: string): Promise<void> {
  const db = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(GAME_STORE, 'readwrite')
      transaction.objectStore(GAME_STORE).delete(id)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export function createDefaultPlayers(): Player[] {
  const numbers = [
    '00',
    '0',
    ...Array.from({ length: 99 }, (_, index) => String(index + 1)),
  ]

  return numbers.map((number) => ({
    id: crypto.randomUUID(),
    number,
    name: `#${number}`,
    active: true,
  }))
}

/** バックアップからチーム・試合データをまとめて置き換える。単一トランザクションで処理する。 */
export async function replaceAllData(teams: Team[], games: Game[]): Promise<void> {
  const db = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([TEAM_STORE, GAME_STORE], 'readwrite')
      const teamStore = transaction.objectStore(TEAM_STORE)
      const gameStore = transaction.objectStore(GAME_STORE)
      teamStore.clear()
      gameStore.clear()
      teams.forEach((team) => teamStore.put(team))
      games.forEach((game) => gameStore.put(game))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

