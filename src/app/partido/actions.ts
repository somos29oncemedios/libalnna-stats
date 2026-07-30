'use server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getLiveGame() {
  const game = await prisma.game.findFirst({
    include: {
      homeTeam: { include: { players: true } },
      awayTeam: { include: { players: true } },
      stats: true,
    }
  })
  return game
}