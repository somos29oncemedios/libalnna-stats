import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const game = await prisma.game.findFirst({
      include: {
        homeTeam: { 
          include: { 
            roster: { 
              include: { player: true } 
            } 
          } 
        },
        awayTeam: { 
          include: { 
            roster: { 
              include: { player: true } 
            } 
          } 
        },
        stats: true,
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'No games found' }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }// actualización forzada
}