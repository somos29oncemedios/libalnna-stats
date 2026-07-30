import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Crear categoría U11
    const category = await prisma.category.create({
      data: { name: 'U11' }
    })

    // 2. Crear Equipo Local
    const teamA = await prisma.team.create({
      data: {
        name: 'LIBALNNA U11',
        categoryId: category.id,
        players: {
          create: [
            { name: 'Jugador 1', jerseyNumber: '10' },
            { name: 'Jugador 2', jerseyNumber: '23' },
          ]
        }
      }
    })

    // 3. Crear Equipo Visitante
    const teamB = await prisma.team.create({
      data: {
        name: 'Molino Viejo',
        categoryId: category.id,
        players: {
          create: [
            { name: 'Rival 1', jerseyNumber: '7' },
            { name: 'Rival 2', jerseyNumber: '11' },
          ]
        }
      }
    })

    // 4. Crear un Partido programado
    const game = await prisma.game.create({
      data: {
        date: new Date(),
        categoryId: category.id,
        homeTeamId: teamA.id,
        awayTeamId: teamB.id,
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: '¡Datos insertados con éxito en la base de datos!', 
      gameId: game.id 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}