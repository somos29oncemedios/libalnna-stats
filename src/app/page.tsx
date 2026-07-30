import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function HomePage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      teams: true,
      games: {
        include: { 
          homeTeam: true, 
          awayTeam: true,
          stats: { include: { player: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <main style={{ background: '#EDEDED', minHeight: '100vh', color: '#000000', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* 1. BANNER PRINCIPAL */}
      <section style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '350px', 
        background: '#000000', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        borderBottom: '4px solid #0074c9',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ background: '#ffffff', color: '#000000', fontWeight: '900', padding: '6px 18px', borderRadius: '24px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '25px' }}>
            Portal Oficial
          </span>
          
          {/* LOGOTIPO OFICIAL REEMPLAZANDO EL TEXTO */}
          <img 
            src="/logo.png" 
            alt="Logo Oficial LIBALNNA" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto', marginBottom: '20px', objectFit: 'contain' }}
          />

          <p style={{ fontSize: '1.2rem', color: '#a3a3a3', maxWidth: '650px', margin: '0 auto', fontWeight: '500' }}>
            Estadísticas, Calendario y Resultados en Vivo.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 20px' }}>
        {tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#000', background: '#ffffff', borderRadius: '12px', border: '2px solid #000', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontWeight: '900', textTransform: 'uppercase' }}>Aún no hay torneos activos</h2>
          </div>
        ) : (
          tournaments.map(tourney => {
            const upcomingGames = tourney.games.filter(g => g.status === 'SCHEDULED' || g.status === 'LIVE')
            const finishedGames = tourney.games.filter(g => g.status === 'FINISHED')
            const categories = Array.from(new Set(tourney.teams.map(t => t.category)))

            return (
              <div key={tourney.id} style={{ marginBottom: '80px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>
                    {tourney.name}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '15px' }}>
                    <div style={{ width: '40px', height: '4px', background: '#0074c9' }}></div>
                    <div style={{ width: '40px', height: '4px', background: '#ffc306' }}></div>
                  </div>
                </div>

                {/* 2. TABLA DE POSICIONES */}
                <section style={{ marginBottom: '70px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#000000', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#0074c9' }}>/</span> Tabla de Posiciones
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {categories.map(cat => {
                      const catTeams = tourney.teams.filter(t => t.category === cat)
                      const catGames = tourney.games.filter(g => g.status === 'FINISHED' && (catTeams.some(t => t.id === g.homeTeamId)))

                      const standings = catTeams.map(team => {
                        let played = 0, wins = 0, losses = 0, pf = 0, pc = 0, pts = 0
                        catGames.filter(g => g.stage === 'REGULAR').forEach(g => {
                          if (g.homeTeamId === team.id || g.awayTeamId === team.id) {
                            played++
                            const isHome = g.homeTeamId === team.id
                            const teamScore = isHome ? g.homeScore : g.awayScore
                            const oppScore = isHome ? g.awayScore : g.homeScore
                            pf += teamScore
                            pc += oppScore
                            if (teamScore > oppScore) { wins++; pts += 2; }
                            else if (teamScore < oppScore) { losses++; pts += 1; }
                          }
                        })
                        return { team, played, wins, losses, pf, pc, diff: pf - pc, pts }
                      }).sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.diff - a.diff)

                      return (
                        <div key={cat} style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '2px solid #000000', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                          <div style={{ background: '#000000', padding: '15px' }}>
                            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase' }}>
                              Categoría {cat}
                            </h4>
                          </div>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.95rem' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid #000000', color: '#000000', background: '#f9f9f9' }}>
                                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '800' }}>Equipo</th>
                                  <th style={{ padding: '15px 8px', fontWeight: '800' }}>JJ</th>
                                  <th style={{ padding: '15px 8px', fontWeight: '800' }}>JG</th>
                                  <th style={{ padding: '15px 8px', fontWeight: '800' }}>JP</th>
                                  <th style={{ padding: '15px 8px', fontWeight: '800' }}>Dif</th>
                                  <th style={{ padding: '15px 10px', fontWeight: '900' }}>Pts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {standings.length === 0 ? (
                                  <tr><td colSpan={6} style={{ padding: '20px', color: '#666' }}>Sin equipos inscritos</td></tr>
                                ) : (
                                  standings.map((row, idx) => (
                                    <tr key={row.team.id} style={{ borderBottom: '1px solid #eaeaea', background: '#ffffff' }}>
                                      <td style={{ padding: '15px', textAlign: 'left', fontWeight: '800', color: '#000000' }}>
                                        {idx + 1}. {row.team.name}
                                      </td>
                                      <td style={{ padding: '15px 8px', color: '#000' }}>{row.played}</td>
                                      <td style={{ padding: '15px 8px', color: '#00a83c', fontWeight: '900' }}>{row.wins}</td>
                                      <td style={{ padding: '15px 8px', color: '#ed0044', fontWeight: '900' }}>{row.losses}</td>
                                      <td style={{ padding: '15px 8px', color: row.diff > 0 ? '#00a83c' : row.diff < 0 ? '#ed0044' : '#000', fontWeight: '700' }}>
                                        {row.diff > 0 ? `+${row.diff}` : row.diff}
                                      </td>
                                      <td style={{ padding: '15px 10px', fontWeight: '900', color: '#0074c9', fontSize: '1.1rem' }}>{row.pts}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* 3. JUGADORES MÁS DESTACADOS */}
                <section style={{ marginBottom: '70px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#000000', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#ffc306' }}>/</span> Jugadores Destacados
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                    {categories.map(cat => {
                      const catTeams = tourney.teams.filter(t => t.category === cat)
                      const catGames = tourney.games.filter(g => g.status === 'FINISHED' && (catTeams.some(t => t.id === g.homeTeamId)))

                      const playerStatsMap: Record<string, { name: string, teamName: string, points: number }> = {}
                      catGames.forEach(g => {
                        g.stats.forEach(stat => {
                          const team = catTeams.find(t => t.id === stat.teamId)
                          if (team) {
                            if (!playerStatsMap[stat.playerId]) {
                              playerStatsMap[stat.playerId] = { name: stat.player.name, teamName: team.name, points: 0 }
                            }
                            playerStatsMap[stat.playerId].points += stat.points
                          }
                        })
                      })

                      const topScorers = Object.values(playerStatsMap)
                        .filter(p => p.points > 0)
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 5)

                      return (
                        <div key={cat} style={{ background: '#ffffff', borderRadius: '12px', border: '2px solid #000000', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ margin: '0 0 20px 0', color: '#000000', fontSize: '1.2rem', borderBottom: '2px solid #000000', paddingBottom: '10px', fontWeight: '900', textTransform: 'uppercase' }}>
                            Top Anotadores - Cat. {cat}
                          </h4>
                          {topScorers.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>Sin registros aún.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {topScorers.map((scorer, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: idx === 0 ? '#ffc306' : '#000000', minWidth: '25px' }}>
                                      #{idx + 1}
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontWeight: '800', color: '#000000', fontSize: '1rem', textTransform: 'uppercase' }}>{scorer.name}</span>
                                      <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>{scorer.teamName}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0074c9' }}>{scorer.points}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#000000', fontWeight: '800' }}>PTS</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* 4. CALENDARIO DE PARTIDOS Y RESULTADOS */}
                <section>
                  <h3 style={{ fontSize: '1.6rem', color: '#000000', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#000000' }}>/</span> Calendario y Resultados
                  </h3>

                  {/* Próximos Juegos */}
                  <div style={{ marginBottom: '50px' }}>
                    <h4 style={{ color: '#000000', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', borderBottom: '1px solid #d4d4d4', paddingBottom: '10px' }}>
                      Próximos Encuentros
                    </h4>
                    {upcomingGames.length === 0 ? (
                      <p style={{ color: '#666', fontStyle: 'italic', background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea' }}>No hay partidos programados.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {upcomingGames.map(game => (
                          <div key={game.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: game.status === 'LIVE' ? '2px solid #ed0044' : '1px solid #000000', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            {game.status === 'LIVE' && (
                              <span style={{ position: 'absolute', top: '-12px', right: '15px', background: '#ed0044', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                En Vivo
                              </span>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <h5 style={{ margin: 0, fontSize: '1.15rem', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>{game.homeTeam.name}</h5>
                              </div>
                              <span style={{ fontSize: '0.9rem', color: '#ffffff', background: '#000000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>VS</span>
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <h5 style={{ margin: 0, fontSize: '1.15rem', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>{game.awayTeam.name}</h5>
                              </div>
                            </div>
                            
                            <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#000', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #eaeaea' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eaeaea', paddingBottom: '6px' }}>
                                <span style={{ fontWeight: '800' }}>Cat: {game.homeTeam.category}</span>
                                <span style={{ color: '#0074c9', fontWeight: '900' }}>{game.stage}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                                <span style={{ fontWeight: '600' }}>📅 {game.date || 'Por definir'}</span>
                                <span style={{ fontWeight: '600' }}>⏰ {game.time || 'Por definir'}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: '600' }}>📍 {game.venue || 'Gimnasio por definir'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resultados */}
                  <div>
                    <h4 style={{ color: '#000000', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', borderBottom: '1px solid #d4d4d4', paddingBottom: '10px' }}>
                      Resultados Recientes
                    </h4>
                    {finishedGames.length === 0 ? (
                      <p style={{ color: '#666', fontStyle: 'italic', background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea' }}>Aún no hay partidos finalizados.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {finishedGames.slice(0, 6).map(game => (
                          <div key={game.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #000000', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.8rem', color: '#000000', borderBottom: '1px solid #eaeaea', paddingBottom: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                              <span>{game.date || 'Fecha N/A'} • {game.stage} • Cat: {game.homeTeam.category}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ flex: 1, textAlign: 'right' }}>
                                <span style={{ fontWeight: '900', fontSize: '1.05rem', color: '#000000', textTransform: 'uppercase' }}>{game.homeTeam.name}</span>
                              </div>
                              <div style={{ padding: '0 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: game.homeScore > game.awayScore ? '#0074c9' : '#000000' }}>{game.homeScore}</span>
                                <span style={{ color: '#eaeaea', fontWeight: '900' }}>-</span>
                                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: game.awayScore > game.homeScore ? '#0074c9' : '#000000' }}>{game.awayScore}</span>
                              </div>
                              <div style={{ flex: 1, textAlign: 'left' }}>
                                <span style={{ fontWeight: '900', fontSize: '1.05rem', color: '#000000', textTransform: 'uppercase' }}>{game.awayTeam.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </section>

              </div>
            )
          })
        )}
      </div>
    </main>
  )
}