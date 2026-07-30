'use server'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createTournament(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.tournament.create({
    data: { name, active: true }
  })
  revalidatePath('/admin')
}

export async function createTeam(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const tournamentId = formData.get('tournamentId') as string
  const logoUrl = formData.get('logoUrl') as string

  if (!name || !category || !tournamentId) return

  await prisma.team.create({
    data: { name, category, tournamentId, logoUrl: logoUrl || null } as any
  })
  revalidatePath('/admin')
}

export async function registerPlayerToTeam(formData: FormData) {
  const playerName = formData.get('playerName') as string
  const photoUrl = formData.get('photoUrl') as string
  const teamId = formData.get('teamId') as string
  const jerseyNumber = formData.get('jerseyNumber') as string

  if (!playerName || !teamId || !jerseyNumber) return

  let player = await prisma.player.findFirst({
    where: { name: playerName }
  })

  if (!player) {
    player = await prisma.player.create({
      data: { name: playerName, photoUrl: photoUrl || null }
    })
  } else if (photoUrl && !player.photoUrl) {
    await prisma.player.update({
      where: { id: player.id },
      data: { photoUrl }
    })
  }

  await prisma.playerTeam.upsert({
    where: { playerId_teamId: { playerId: player.id, teamId } },
    update: { jerseyNumber },
    create: { playerId: player.id, teamId, jerseyNumber }
  })

  revalidatePath('/admin')
}

export async function createGame(formData: FormData) {
  const tournamentId = formData.get('tournamentId') as string
  const homeTeamId = formData.get('homeTeamId') as string
  const awayTeamId = formData.get('awayTeamId') as string
  const stage = formData.get('stage') as string || 'REGULAR'
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const venue = formData.get('venue') as string

  if (!tournamentId || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return

  await prisma.game.create({
    data: {
      tournamentId,
      homeTeamId,
      awayTeamId,
      stage,
      date: date || null,
      time: time || null,
      venue: venue || null,
      status: 'SCHEDULED'
    } as any
  })

  revalidatePath('/admin')
  revalidatePath('/mesa')
  revalidatePath('/partido')
}

export async function updateGameSchedule(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const venue = formData.get('venue') as string
  const stage = formData.get('stage') as string

  if (!gameId) return

  await prisma.game.update({
    where: { id: gameId },
    data: {
      date: date || null,
      time: time || null,
      venue: venue || null,
      stage: stage || 'REGULAR'
    } as any
  })

  revalidatePath('/admin')
  revalidatePath('/mesa')
  revalidatePath('/partido')
}

export async function updateGameScore(formData: FormData) {
  const gameId = formData.get('gameId') as string
  const homeScore = parseInt(formData.get('homeScore') as string || '0')
  const awayScore = parseInt(formData.get('awayScore') as string || '0')

  if (!gameId) return

  await prisma.game.update({
    where: { id: gameId },
    data: { homeScore, awayScore, status: 'FINISHED' } as any
  })

  revalidatePath('/admin')
  revalidatePath('/mesa')
  revalidatePath('/partido')
}

type TeamStat = {
  teamId: string
  teamName: string
  played: number
  wins: number
  losses: number
  pf: number
  pc: number
  pts: number
}

export async function generatePlayoffs(formData: FormData) {
  const tournamentId = formData.get('tournamentId') as string
  const category = formData.get('category') as string
  const stage = formData.get('stage') as string 
  const qualifyingCount = parseInt(formData.get('qualifyingCount') as string || '4')

  if (!tournamentId || !category || !stage) return

  const teams = await prisma.team.findMany({
    where: { tournamentId, category }
  })

  const games = await prisma.game.findMany({
    where: {
      tournamentId,
      status: 'FINISHED',
      stage: 'REGULAR',
      OR: [
        { homeTeamId: { in: teams.map(t => t.id) } },
        { awayTeamId: { in: teams.map(t => t.id) } }
      ]
    }
  })

  const statsMap: Record<string, TeamStat> = {}
  teams.forEach(t => {
    statsMap[t.id] = { teamId: t.id, teamName: t.name, played: 0, wins: 0, losses: 0, pf: 0, pc: 0, pts: 0 }
  })

  games.forEach(g => {
    if (statsMap[g.homeTeamId] && statsMap[g.awayTeamId]) {
      statsMap[g.homeTeamId].played++
      statsMap[g.awayTeamId].played++
      statsMap[g.homeTeamId].pf += g.homeScore
      statsMap[g.homeTeamId].pc += g.awayScore
      statsMap[g.awayTeamId].pf += g.awayScore
      statsMap[g.awayTeamId].pc += g.homeScore

      if (g.homeScore > g.awayScore) {
        statsMap[g.homeTeamId].wins++
        statsMap[g.homeTeamId].pts += 2
        statsMap[g.awayTeamId].losses++
        statsMap[g.awayTeamId].pts += 1
      } else if (g.awayScore > g.homeScore) {
        statsMap[g.awayTeamId].wins++
        statsMap[g.awayTeamId].pts += 2
        statsMap[g.homeTeamId].losses++
        statsMap[g.homeTeamId].pts += 1
      }
    }
  })

  const sortedTeams = Object.values(statsMap).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    return (b.pf - b.pc) - (a.pf - a.pc)
  })

  const qualified = sortedTeams.slice(0, qualifyingCount).map(s => s.teamId)
  if (qualified.length < 2) return

  for (let i = 0; i < qualified.length / 2; i++) {
    await prisma.game.create({
      data: {
        tournamentId,
        homeTeamId: qualified[i],
        awayTeamId: qualified[qualified.length - 1 - i],
        stage,
        status: 'SCHEDULED'
      }
    })
  }

  revalidatePath('/admin')
}