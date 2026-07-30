import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const game = await prisma.game.findFirst({
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } },
        stats: true,
      }
    })

    return NextResponse.json({ success: true, game })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}