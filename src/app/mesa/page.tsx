import React from 'react'
import { PrismaClient } from '@prisma/client'
import { addPlayerStat, updateGameStatus, updateGamePeriod, addPlayerFoul, removePlayerFoul, callTimeout } from './actions'

const prisma = new PrismaClient()

export default async function MesaPage() {
  const games = await prisma.game.findMany({
    include: {
      tournament: true,
      homeTeam: {
        include: { roster: { include: { player: true } } }
      },
      awayTeam: {
        include: { roster: { include: { player: true } } }
      },
      stats: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return React.createElement('main', { style: { padding: '30px', fontFamily: 'sans-serif', background: '#0f172a', color: 'white', minHeight: '100vh' } },
    React.createElement('div', { style: { maxWidth: '1250px', margin: '0 auto' } },
      
      React.createElement('header', { style: { textAlign: 'center', marginBottom: '35px' } },
        React.createElement('h1', { style: { fontSize: '2.3rem', margin: '0 0 8px 0', color: '#38bdf8' } }, 'Mesa Técnica en Vivo - LIBALNNA'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '1.05rem' } }, 'Control de marcador, cuartos, faltas y tiempos muertos (Timeouts)')
      ),

      games.length === 0
        ? React.createElement('div', { style: { background: '#1e293b', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' } },
            React.createElement('p', null, 'No hay partidos programados en el sistema.')
          )
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '30px' } },
            games.map(game => {
              const homeStats = game.stats.filter(s => s.teamId === game.homeTeamId)
              const awayStats = game.stats.filter(s => s.teamId === game.awayTeamId)

              return React.createElement('div', { key: game.id, style: { background: '#1e293b', padding: '25px', borderRadius: '14px', border: '1px solid #334155' } },
                
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' } },
                  React.createElement('span', { style: { color: '#38bdf8', fontWeight: 'bold' } }, `🏆 ${game.tournament.name} (${game.stage})`),
                  
                  React.createElement('div', { style: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' } },
                    
                    React.createElement('form', { action: updateGamePeriod, style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                      React.createElement('select', { name: 'period', defaultValue: game.period || '1Q', style: { background: '#0f172a', color: '#f59e0b', border: '1px solid #475569', padding: '5px 10px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' } },
                        React.createElement('option', { value: '1Q' }, '1er Cuarto (1Q)'),
                        React.createElement('option', { value: '2Q' }, '2do Cuarto (2Q)'),
                        React.createElement('option', { value: 'HALF' }, 'Medio Tiempo'),
                        React.createElement('option', { value: '3Q' }, '3er Cuarto (3Q)'),
                        React.createElement('option', { value: '4Q' }, '4to Cuarto (4Q)'),
                        React.createElement('option', { value: 'OT' }, 'Tiempo Extra (OT)')
                      ),
                      React.createElement('button', { type: 'submit', style: { background: '#f59e0b', color: '#0f172a', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' } }, 'Fijar Cuarto')
                    ),

                    React.createElement('form', { action: updateGameStatus, style: { display: 'flex', gap: '8px', alignItems: 'center', borderLeft: '1px solid #334155', paddingLeft: '15px' } },
                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                      React.createElement('select', { name: 'status', defaultValue: game.status, style: { background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' } },
                        React.createElement('option', { value: 'SCHEDULED' }, 'PROGRAMADO'),
                        React.createElement('option', { value: 'LIVE' }, 'EN VIVO 🔴'),
                        React.createElement('option', { value: 'FINISHED' }, 'FINALIZADO 🏁')
                      ),
                      React.createElement('button', { type: 'submit', style: { background: '#334155', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' } }, 'Estado')
                    )
                  )
                ),

                // Marcador Central y Tiempos Muertos
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', textAlign: 'center', marginBottom: '25px', background: '#0f172a', padding: '15px', borderRadius: '10px' } },
                  
                  // Local y su botón de Timeout
                  React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                    React.createElement('h3', { style: { margin: '0', fontSize: '1.3rem' } }, game.homeTeam.name),
                    React.createElement('span', { style: { fontSize: '3rem', fontWeight: 'bold', color: '#38bdf8' } }, game.homeScore),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                      React.createElement('span', { style: { fontSize: '0.85rem', color: '#94a3b8' } }, `Timeouts: ${game.homeTimeouts}`),
                      React.createElement('form', { action: callTimeout },
                        React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                        React.createElement('input', { type: 'hidden', name: 'teamType', value: 'home' }),
                        React.createElement('button', { type: 'submit', style: { background: '#334155', color: '#38bdf8', border: '1px solid #475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '⏱️ Pedir Timeout')
                      )
                    )
                  ),
                  
                  // Centro (Período)
                  React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                    React.createElement('span', { style: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' } }, 'PERÍODO'),
                    React.createElement('span', { style: { background: '#f59e0b', color: '#0f172a', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.2rem' } }, game.period || '1Q')
                  ),

                  // Visitante y su botón de Timeout
                  React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                    React.createElement('h3', { style: { margin: '0', fontSize: '1.3rem' } }, game.awayTeam.name),
                    React.createElement('span', { style: { fontSize: '3rem', fontWeight: 'bold', color: '#38bdf8' } }, game.awayScore),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                      React.createElement('form', { action: callTimeout },
                        React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                        React.createElement('input', { type: 'hidden', name: 'teamType', value: 'away' }),
                        React.createElement('button', { type: 'submit', style: { background: '#334155', color: '#38bdf8', border: '1px solid #475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '⏱️ Pedir Timeout')
                      ),
                      React.createElement('span', { style: { fontSize: '0.85rem', color: '#94a3b8' } }, `Timeouts: ${game.awayTimeouts}`)
                    )
                  )
                ),

                // Listados de Roster (Local y Visitante con Faltas y Puntos)
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' } },
                  
                  // Roster Local
                  React.createElement('div', { style: { background: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #475569' } },
                    React.createElement('h4', { style: { color: '#38bdf8', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '6px' } }, `Plantilla Local: ${game.homeTeam.name}`),
                    game.homeTeam.roster.length === 0 
                      ? React.createElement('p', { style: { color: '#64748b', fontSize: '0.85rem' } }, 'Sin jugadores inscritos.')
                      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                          game.homeTeam.roster.map(item => {
                            const pStat = homeStats.find(s => s.playerId === item.player.id)
                            const pts = pStat ? pStat.points : 0
                            const fouls = pStat ? pStat.fouls : 0
                            const isFouledOut = fouls >= 5

                            return React.createElement('div', { key: item.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px 12px', borderRadius: '6px', opacity: isFouledOut ? 0.6 : 1 } },
                              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                React.createElement('span', { style: { background: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#38bdf8' } }, `#${item.jerseyNumber}`),
                                React.createElement('span', { style: { fontSize: '0.9rem', textDecoration: isFouledOut ? 'line-through' : 'none' } }, item.player.name),
                                React.createElement('span', { style: { color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '5px' } }, `${pts} pts`),
                                React.createElement('span', { style: { color: fouls >= 4 ? '#ef4444' : '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '5px' } }, `| ${fouls} F`)
                              ),
                              
                              isFouledOut 
                                ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                    React.createElement('span', { style: { background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' } }, '🔴 EXPULSADO'),
                                    React.createElement('form', { action: removePlayerFoul },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('button', { type: 'submit', style: { background: '#475569', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '-F')
                                    )
                                  )
                                : React.createElement('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } },
                                    React.createElement('form', { action: addPlayerFoul },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.homeTeamId }),
                                      React.createElement('button', { type: 'submit', style: { background: '#dc2626', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+F')
                                    ),
                                    React.createElement('form', { action: removePlayerFoul, style: { marginRight: '6px' } },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('button', { type: 'submit', style: { background: '#475569', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '-F')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.homeTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'home' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '1' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#059669', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+1')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.homeTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'home' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '2' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#0284c7', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+2')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.homeTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'home' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '3' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#7c3aed', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+3')
                                    )
                                  )
                            )
                          })
                        )
                  ),

                  // Roster Visitante
                  React.createElement('div', { style: { background: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #475569' } },
                    React.createElement('h4', { style: { color: '#38bdf8', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '6px' } }, `Plantilla Visitante: ${game.awayTeam.name}`),
                    game.awayTeam.roster.length === 0 
                      ? React.createElement('p', { style: { color: '#64748b', fontSize: '0.85rem' } }, 'Sin jugadores inscritos.')
                      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                          game.awayTeam.roster.map(item => {
                            const pStat = awayStats.find(s => s.playerId === item.player.id)
                            const pts = pStat ? pStat.points : 0
                            const fouls = pStat ? pStat.fouls : 0
                            const isFouledOut = fouls >= 5

                            return React.createElement('div', { key: item.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px 12px', borderRadius: '6px', opacity: isFouledOut ? 0.6 : 1 } },
                              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                React.createElement('span', { style: { background: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#38bdf8' } }, `#${item.jerseyNumber}`),
                                React.createElement('span', { style: { fontSize: '0.9rem', textDecoration: isFouledOut ? 'line-through' : 'none' } }, item.player.name),
                                React.createElement('span', { style: { color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '5px' } }, `${pts} pts`),
                                React.createElement('span', { style: { color: fouls >= 4 ? '#ef4444' : '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '5px' } }, `| ${fouls} F`)
                              ),
                              
                              isFouledOut 
                                ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                    React.createElement('span', { style: { background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' } }, '🔴 EXPULSADO'),
                                    React.createElement('form', { action: removePlayerFoul },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('button', { type: 'submit', style: { background: '#475569', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '-F')
                                    )
                                  )
                                : React.createElement('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } },
                                    React.createElement('form', { action: addPlayerFoul },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.awayTeamId }),
                                      React.createElement('button', { type: 'submit', style: { background: '#dc2626', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+F')
                                    ),
                                    React.createElement('form', { action: removePlayerFoul, style: { marginRight: '6px' } },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('button', { type: 'submit', style: { background: '#475569', color: 'white', border: 'none', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '-F')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.awayTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'away' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '1' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#059669', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+1')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.awayTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'away' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '2' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#0284c7', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+2')
                                    ),
                                    React.createElement('form', { action: addPlayerStat },
                                      React.createElement('input', { type: 'hidden', name: 'gameId', value: game.id }),
                                      React.createElement('input', { type: 'hidden', name: 'playerId', value: item.player.id }),
                                      React.createElement('input', { type: 'hidden', name: 'teamId', value: game.awayTeamId }),
                                      React.createElement('input', { type: 'hidden', name: 'teamType', value: 'away' }),
                                      React.createElement('input', { type: 'hidden', name: 'pointsDelta', value: '3' }),
                                      React.createElement('button', { type: 'submit', style: { background: '#7c3aed', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' } }, '+3')
                                    )
                                  )
                            )
                          })
                        )
                  )

                )

              )
            })
          )

    )
  )
}