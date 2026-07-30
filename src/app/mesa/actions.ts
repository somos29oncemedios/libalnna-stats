'use server'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function modifyScore(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const teamType = formData.get('teamType') as 'home' | 'away'
  const amount = parseInt(formData.get('amount') as string || '0')

  if (!gameId) return

  const game = await prisma.game.findUnique({
    where: { id: gameId }
  })

  if (!game) return

  const data: any = { status: 'LIVE' }
  if (teamType === 'home') {
    data.homeScore = Math.max(0, game.homeScore + amount)
  } else {
    data.awayScore = Math.max(0, game.awayScore + amount)
  }

  await prisma.game.update({
    where: { id: gameId },
    data
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function addPlayerStat(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const playerId = formData.get('playerId') as string
  const teamId = formData.get('teamId') as string
  const teamType = formData.get('teamType') as 'home' | 'away'
  const pointsDelta = parseInt(formData.get('pointsDelta') as string || '0')

  if (!gameId || !playerId || !teamId) return

  let stat = await prisma.gameStat.findUnique({
    where: { gameId_playerId: { gameId, playerId } }
  })

  const currentPoints = stat ? stat.points : 0
  const newPoints = Math.max(0, currentPoints + pointsDelta)

  await prisma.gameStat.upsert({
    where: { gameId_playerId: { gameId, playerId } },
    update: { points: newPoints },
    create: { gameId, playerId, teamId, points: newPoints }
  })

  const game = await prisma.game.findUnique({ where: { id: gameId } })
  if (!game) return

  const data: any = { status: 'LIVE' }
  if (teamType === 'home') {
    data.homeScore = Math.max(0, game.homeScore + pointsDelta)
  } else {
    data.awayScore = Math.max(0, game.awayScore + pointsDelta)
  }

  await prisma.game.update({
    where: { id: gameId },
    data
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function addPlayerFoul(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const playerId = formData.get('playerId') as string
  const teamId = formData.get('teamId') as string

  if (!gameId || !playerId || !teamId) return

  let stat = await prisma.gameStat.findUnique({
    where: { gameId_playerId: { gameId, playerId } }
  })

  const currentFouls = stat ? stat.fouls : 0
  
  if (currentFouls >= 5) return

  const newFouls = currentFouls + 1

  await prisma.gameStat.upsert({
    where: { gameId_playerId: { gameId, playerId } },
    update: { fouls: newFouls },
    create: { gameId, playerId, teamId, fouls: newFouls, points: 0 }
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
}

export async function removePlayerFoul(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const playerId = formData.get('playerId') as string

  if (!gameId || !playerId) return

  let stat = await prisma.gameStat.findUnique({
    where: { gameId_playerId: { gameId, playerId } }
  })

  if (!stat) return

  const currentFouls = stat.fouls
  if (currentFouls <= 0) return

  const newFouls = currentFouls - 1

  await prisma.gameStat.update({
    where: { gameId_playerId: { gameId, playerId } },
    data: { fouls: newFouls }
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
}

export async function updateGameStatus(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const status = formData.get('status') as string

  if (!gameId || !status) return

  await prisma.game.update({
    where: { id: gameId },
    data: { status } as any
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateGamePeriod(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const period = formData.get('period') as string

  if (!gameId || !period) return

  await prisma.game.update({
    where: { id: gameId },
    data: { period } as any
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
  revalidatePath('/')
}export async function callTimeout(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const teamType = formData.get('teamType') as 'home' | 'away'

  if (!gameId) return

  const game = await prisma.game.findUnique({ where: { id: gameId } })
  if (!game) return

  const data: any = {}
  if (teamType === 'home') {
    if (game.homeTimeouts > 0) {
      data.homeTimeouts = game.homeTimeouts - 1
    } else {
      return // Sin tiempos muertos disponibles
    }
  } else {
    if (game.awayTimeouts > 0) {
      data.awayTimeouts = game.awayTimeouts - 1
    } else {
      return
    }
  }

  await prisma.game.update({
    where: { id: gameId },
    data
  })

  revalidatePath('/mesa')
  revalidatePath('/partido')
}