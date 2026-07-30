'use client'
import React, { useEffect, useState } from 'react'
import { getLiveGame } from './actions'

export default function PartidoPage() {
  const [gameData, setGameData] = useState(null as any)

  useEffect(() => {
    let mounted = true
    const fetchGame = async () => {
      const game = await getLiveGame()
      if (game && mounted) {
        setGameData(game)
      }
    }
    
    fetchGame()
    const interval = setInterval(fetchGame, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!gameData) {
    return React.createElement('div',
      { style: { padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', marginTop: '50px' } },
      React.createElement('h2', null, 'Cargando estadísticas en vivo...')
    )
  }

  const homePoints = gameData.stats.filter((s: any) => s.teamId === gameData.homeTeamId).reduce((acc: number, curr: any) => acc + curr.points, 0)
  const awayPoints = gameData.stats.filter((s: any) => s.teamId === gameData.awayTeamId).reduce((acc: number, curr: any) => acc + curr.points, 0)

  const renderTable = (team: any, teamId: string, bgHeader: string) => {
    return React.createElement('div', { style: { marginBottom: '30px', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
      React.createElement('div', { style: { background: bgHeader, color: 'white', padding: '15px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' } }, team.name),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'center' } },
        React.createElement('thead', { style: { background: '#f8fafc', fontSize: '0.9rem', color: '#64748b', borderBottom: '2px solid #e2e8f0' } },
          React.createElement('tr', null,
            React.createElement('th', { style: { padding: '12px 15px', textAlign: 'left' } }, 'Jugador'),
            React.createElement('th', { style: { padding: '12px 8px' } }, 'PTS'),
            React.createElement('th', { style: { padding: '12px 8px' } }, 'F')
          )
        ),
        React.createElement('tbody', null,
          team.players.map((player: any, idx: number) => {
            const stat = gameData.stats.find((s: any) => s.playerId === player.id) || { points: 0, fouls: 0 }
            
            const avatar = player.photoUrl 
              ? React.createElement('img', { src: player.photoUrl, alt: player.name, style: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px', flexShrink: 0 } })
              : React.createElement('div', { style: { width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', marginRight: '10px', flexShrink: 0 } }, `#${player.jerseyNumber}`)

            return React.createElement('tr', { key: player.id, style: { borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' } },
              React.createElement('td', { style: { padding: '10px 15px', textAlign: 'left', display: 'flex', alignItems: 'center' } },
                avatar,
                React.createElement('div', null,
                  React.createElement('strong', { style: { color: '#0f172a', marginRight: '6px' } }, `#${player.jerseyNumber}`),
                  React.createElement('span', { style: { color: '#334155' } }, player.name)
                )
              ),
              React.createElement('td', { style: { padding: '10px 8px', fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' } }, stat.points),
              React.createElement('td', { style: { padding: '10px 8px', color: '#64748b' } }, stat.fouls)
            )
          })
        )
      )
    )
  }

  return React.createElement('main', { style: { background: '#f1f5f9', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' } },
    React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto' } },
      React.createElement('header', { style: { textAlign: 'center', marginBottom: '25px', marginTop: '10px' } },
        React.createElement('div', { style: { display: 'inline-block', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' } }, 'EN VIVO'),
        React.createElement('div', { style: { background: 'white', padding: '25px 20px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '1rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' } }, gameData.homeTeam.name),
              React.createElement('div', { style: { fontSize: '3.5rem', fontWeight: '900', color: '#0284c7', lineHeight: '1' } }, homePoints)
            ),
            React.createElement('div', { style: { color: '#cbd5e1', fontWeight: '900', fontSize: '1.5rem', padding: '0 10px' } }, 'VS'),
            React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '1rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' } }, gameData.awayTeam.name),
              React.createElement('div', { style: { fontSize: '3.5rem', fontWeight: '900', color: '#e11d48', lineHeight: '1' } }, awayPoints)
            )
          )
        )
      ),
      renderTable(gameData.homeTeam, gameData.homeTeamId, '#0284c7'),
      renderTable(gameData.awayTeam, gameData.awayTeamId, '#e11d48')
    )
  )
}