# NFL Week 10 Full-Slate Method-Required Dossier — Nov 12–16, 2026

Slate: 14 games (Thu WSH@NYG; Sun 12-game slate incl. Munich GNL NE at DET; Mon Night LAC at BAL). Built 2026-11-13T02:49:56.518Z.

Method class (permitted DVOA/FPI equivalent, self-computed): schedule-adjusted SRS power ratings (iterative margin, estimated HFA=0.50 pts) blended 50/50 with garbage-time-excluded net EPA/play projected over per-team snap estimates. Garbage rule: |margin| >=17 in Q4 or >=21 from Q3. Turnover luck = fumble-coin recovery share vs 50% baseline + league-average INT:PBU conversion ratio r=0.166.

## WAS @ NYG — kickoff 2026-11-13T01:15Z

WAS 2-6 at NYG 5-3. Model margin home-ago 5.71 pts (SRS 5.19, EPA 6.23) vs market home spread 1.5 -> edge -7.21; net EPA/play -0.005 vs -0.001; D-EPA #20/12; 3rdD 35.4%/26.7%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873052), ESPN injuries API, open-meteo (>=5).

**Pick:** NYG win — confidence 70/100 (model margin 5.7 pts)

1. Rest/form/luck — rest 4/4d; last5 L-L-L-W-L/W-L-L-W-W; QBs Jayden Daniels (approx rating 7.7) / J.J. McCarthy (8.8); sack% allowed 7.0/9.2; TO luck A: fumble luck 7/11 vs 50% baseline; INT 6 on 34 PBU vs league-expected 5.65 (league INT:PBU ratio r=0.166); H: fumble luck 3/8 vs 50% baseline; INT 1 on 38 PBU vs league-expected 6.31 (league INT:PBU ratio r=0.166)
2. EPA/play — WAS off -0.026 / def -0.025; NYG off 0.015 / def 0.020
3. Model — SRS -2.82 vs 1.87, HFA 0.50, projected margin 5.71 (SRS comp 5.19 + EPA comp 6.23)
4. Explosive — WAS 6.1% gen / 4.7% allowed; NYG 5.3% / 4.7%
5. Third down/pass rush — conv 26.7% (WAS) vs 35.4% (NYG); stops 64.6%/73.3%; sack rate 7.4%/9.5%
6. Top-3 — WAS: Jayden Daniels (QB), Stefon Diggs (WR), Rachaad White (RB) | NYG: Isaiah Likely (TE), Jaxson Dart (QB), Malik Nabers (WR); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — WAS: Athan Kaliakmanis (Out); Isaac Yiadom (Out); Tanoa Togiai (Out); Ricky Barber (Out); Lucas Patrick (Out); Colson Yankoff (Out) | NYG: Malik Harrison (Out); Nikko Reed (Out); Josh Sills (Out); CJ Okoye (Out); J.C. Davis (Out); Thomas Fidone II (Out)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 48F, precip 72%, wind 3/gust 7 mph; impact: 72% precip probability: turnover/fumble risk elevated, favor under
9. Market — spread open 1.5 -> current 1.5 (home); total open 40.5 -> current 40.5 (trend n/a%); drivers: model-market spread divergence -7.21 pts (item 10); explosive-play matchup 6.1% vs 4.7% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 26.7% vs 35.4% (item 5)
10. Model vs market — model home spread -5.71 vs mkt 1.5, edge -7.21 pts; total model 44.3 vs 40.5 (edge 3.75); EPA margin 6.23 over 73 snaps/team
11. Assumptions — SRS=5.19 pts component + EPA rate margin x 73 snaps = 6.23 pts component -> blend 5.71; D-EPA rank #20 (NYG) vs #12 (WAS); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873052; ESPN injuries API; open-meteo forecast (MetLife Stadium).

## NE @ DET — kickoff 2026-11-15T14:30Z [MUNICH GNL, neutral]

NE 5-4 at DET 6-2. Model margin home-ago 4.03 pts (SRS 3.16, EPA 4.89) vs market home spread -2.5 -> edge -1.53; net EPA/play 0.086 vs 0.053; D-EPA #15/10; 3rdD 32.3%/35.0%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873053), ESPN injuries API, open-meteo (>=5).

**Pick:** DET win — confidence 60/100 (model margin 4.0 pts)

1. Rest/form/luck — rest 7/7d; last5 W-W-L-W-L/L-W-W-W-W; QBs Drake Maye (approx rating 7.9) / Jared Goff (8.6); sack% allowed 6.6/6.5; TO luck A: fumble luck 3/9 vs 50% baseline; INT 2 on 30 PBU vs league-expected 4.98 (league INT:PBU ratio r=0.166); H: fumble luck 2/15 vs 50% baseline; INT 11 on 35 PBU vs league-expected 5.81 (league INT:PBU ratio r=0.166)
2. EPA/play — NE off 0.014 / def -0.040; DET off 0.066 / def -0.020
3. Model — SRS 0.23 vs 3.40, HFA 0, projected margin 4.03 (SRS comp 3.16 + EPA comp 4.89)
4. Explosive — NE 6.2% gen / 5.4% allowed; DET 4.6% / 7.6%
5. Third down/pass rush — conv 35.0% (NE) vs 32.3% (DET); stops 67.7%/65.0%; sack rate 6.9%/6.5%
6. Top-3 — NE: Drake Maye (QB), DeMario Douglas (WR), Hunter Henry (TE) | DET: Jared Goff (QB), Sam LaPorta (TE), Amon-Ra St. Brown (WR); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — NE: Hunter Henry (Questionable); Rhamondre Stevenson (Questionable); A.J. Brown (Questionable); Charles Woods (Questionable); Ben Brown (Out); Kevin Byard (Questionable) | DET: Cade Mays (Out); DJ Wonnum (Questionable); D.J. Reed (Out); Kerby Joseph (Out); Sione Vaki (Questionable); Amon-Ra St. Brown (Questionable)
8. Weather/roof — fixed partial roof over stands, open above pitch (outdoor conditions apply) [nflverse games.csv roof=dome]; T 47F, precip 0%, wind 1/gust 2 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open -1.5 -> current -2.5 (home); total open 48.5 -> current 50.5 (trend 4.1%); drivers: model-market spread divergence -1.53 pts (item 10); explosive-play matchup 6.2% vs 7.6% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 35.0% vs 32.3% (item 5)
10. Model vs market — model home spread -4.03 vs mkt -2.5, edge -1.53 pts; total model 51.2 vs 50.5 (edge 0.69); EPA margin 4.89 over 67 snaps/team
11. Assumptions — SRS=3.16 pts component + EPA rate margin x 67 snaps = 4.89 pts component -> blend 4.03; D-EPA rank #15 (DET) vs #10 (NE); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873053; ESPN injuries API; open-meteo forecast (FC Bayern Munich Stadium).

## KC @ ATL — kickoff 2026-11-15T18:00Z

KC 6-2 at ATL 3-6. Model margin home-ago -11.02 pts (SRS -10.09, EPA -11.95) vs market home spread 3 -> edge 8.02; net EPA/play -0.082 vs 0.082; D-EPA #18/23; 3rdD 30.8%/38.3%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873058), ESPN injuries API, open-meteo (>=5).

**Pick:** KC win — confidence 70/100 (model margin 11.0 pts)

1. Rest/form/luck — rest 7/7d; last5 W-W-L-L-W/L-L-W-L-L; QBs Patrick Mahomes (approx rating 8.1) / Michael Penix Jr. (6.9); sack% allowed 4.0/5.9; TO luck A: fumble luck 4/10 vs 50% baseline; INT 12 on 41 PBU vs league-expected 6.81 (league INT:PBU ratio r=0.166); H: fumble luck 6/11 vs 50% baseline; INT 4 on 39 PBU vs league-expected 6.48 (league INT:PBU ratio r=0.166)
2. EPA/play — KC off 0.104 / def 0.022; ATL off -0.070 / def 0.012
3. Model — SRS 6.43 vs -4.15, HFA 0.50, projected margin -11.02 (SRS comp -10.09 + EPA comp -11.95)
4. Explosive — KC 5.8% gen / 4.3% allowed; ATL 5.8% / 5.7%
5. Third down/pass rush — conv 38.3% (KC) vs 30.8% (ATL); stops 69.2%/61.7%; sack rate 3.7%/5.9%
6. Top-3 — KC: Patrick Mahomes (QB), Kenneth Walker III (RB), Travis Kelce (TE) | ATL: Drake London (WR), Michael Penix Jr. (QB), Austin Hooper (TE); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — KC: Jaydn Ott (Questionable); Peter Woods (Questionable); Jaylon Moore (Questionable) | ATL: Kendal Daniels (Questionable); Cameron Thomas (Questionable); Zachariah Branch (Doubtful); Josh Woods (Questionable); James Pearce Jr. (Questionable); Divine Deablo (Questionable)
8. Weather/roof — retractable-roof stadium; kickoff status not confirmable from free feeds — assumed closed, forecast sampled for reference only; T n/aF, precip n/a%, wind n/a/gust n/a mph; impact: no material weather impact (roofed/assumed-closed venue)
9. Market — spread open 4.5 -> current 3 (home); total open 45.5 -> current 46.5 (trend 2.2%); drivers: model-market spread divergence 8.02 pts (item 10); explosive-play matchup 5.8% vs 5.7% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 38.3% vs 30.8% (item 5)
10. Model vs market — model home spread 11.02 vs mkt 3, edge 8.02 pts; total model 46.1 vs 46.5 (edge -0.36); EPA margin -11.95 over 65 snaps/team
11. Assumptions — SRS=-10.09 pts component + EPA rate margin x 65 snaps = -11.95 pts component -> blend -11.02; D-EPA rank #18 (ATL) vs #23 (KC); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873058; ESPN injuries API; open-meteo forecast (Mercedes-Benz Stadium).

## HOU @ CLE — kickoff 2026-11-15T18:00Z

HOU 3-5 at CLE 5-4. Model margin home-ago -6.38 pts (SRS -5.86, EPA -6.91) vs market home spread 4.5 -> edge 1.88; net EPA/play -0.099 vs 0.104; D-EPA #22/11; 3rdD 31.1%/35.2%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873056), ESPN injuries API, open-meteo (>=5).

**Pick:** HOU win — confidence 61/100 (model margin 6.4 pts)

1. Rest/form/luck — rest 7/7d; last5 L-W-W-L-W/L-W-W-L-L; QBs C.J. Stroud (approx rating 8.8) / Deshaun Watson (7.3); sack% allowed 5.3/11.8; TO luck A: fumble luck 4/12 vs 50% baseline; INT 3 on 44 PBU vs league-expected 7.31 (league INT:PBU ratio r=0.166); H: fumble luck 5/5 vs 50% baseline; INT 2 on 38 PBU vs league-expected 6.31 (league INT:PBU ratio r=0.166)
2. EPA/play — HOU off 0.075 / def -0.029; CLE off -0.078 / def 0.021
3. Model — SRS 2.64 vs -3.72, HFA 0.50, projected margin -6.38 (SRS comp -5.86 + EPA comp -6.91)
4. Explosive — HOU 6.3% gen / 6.5% allowed; CLE 5.5% / 5.2%
5. Third down/pass rush — conv 35.2% (HOU) vs 31.1% (CLE); stops 68.9%/64.8%; sack rate 4.8%/11.0%
6. Top-3 — HOU: C.J. Stroud (QB), Nico Collins (WR), Dalton Schultz (TE) | CLE: Harold Fannin Jr. (TE), Deshaun Watson (QB), KC Concepcion (WR); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — HOU: Reed Blankenship (Questionable); Danielle Hunter (Questionable); Will Anderson Jr. (Questionable); Marvin Harrison Jr. (Questionable); Woody Marks (Questionable); David Montgomery (Questionable) | CLE: Harold Fannin Jr. (Questionable); Denzel Boston (Questionable); Carson Schwesinger (Questionable); Denzel Ward (Questionable); Quincy Williams (Questionable); Michael Burton (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 44F, precip 6%, wind 3/gust 4 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open 4.5 -> current 4.5 (home); total open 38.5 -> current 40.5 (trend 5.2%); drivers: model-market spread divergence 1.88 pts (item 10); explosive-play matchup 6.3% vs 5.2% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 35.2% vs 31.1% (item 5)
10. Model vs market — model home spread 6.38 vs mkt 4.5, edge 1.88 pts; total model 44.0 vs 40.5 (edge 3.51); EPA margin -6.91 over 67 snaps/team
11. Assumptions — SRS=-5.86 pts component + EPA rate margin x 67 snaps = -6.91 pts component -> blend -6.38; D-EPA rank #22 (CLE) vs #11 (HOU); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873056; ESPN injuries API; open-meteo forecast (Huntington Bank Field).

## MIN @ GB — kickoff 2026-11-15T18:00Z

MIN 6-2 at GB 6-3. Model margin home-ago 2.84 pts (SRS -0.43, EPA 6.12) vs market home spread -3 -> edge 0.16; net EPA/play -0.051 vs -0.287; D-EPA #27/32; 3rdD 35.0%/30.0%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873060), ESPN injuries API, open-meteo (>=5).

**Pick:** GB win — confidence 55/100 (model margin 2.8 pts)

1. Rest/form/luck — rest 6/7d; last5 W-W-W-L-L/W-W-L-W-W; QBs Kirk Cousins (approx rating n/a) / Jordan Love (8.0); sack% allowed 9.3/4.7; TO luck A: fumble luck 3/13 vs 50% baseline; INT 6 on 37 PBU vs league-expected 6.15 (league INT:PBU ratio r=0.166); H: fumble luck 6/7 vs 50% baseline; INT 5 on 48 PBU vs league-expected 7.97 (league INT:PBU ratio r=0.166)
2. EPA/play — MIN off -0.137 / def 0.149; GB off 0.027 / def 0.078
3. Model — SRS 3.19 vs 2.26, HFA 0.50, projected margin 2.84 (SRS comp -0.43 + EPA comp 6.12)
4. Explosive — MIN 4.7% gen / 3.6% allowed; GB 7.0% / 3.4%
5. Third down/pass rush — conv 30.0% (MIN) vs 35.0% (GB); stops 65.0%/70.0%; sack rate 9.1%/5.0%
6. Top-3 — MIN: T.J. Hockenson (TE), Justin Jefferson (WR), Max Bredeson (RB) | GB: Jordan Love (QB), Christian Watson (WR), Tucker Kraft (TE); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — MIN: Blake Cashman (Questionable); Jauan Jennings (Questionable); Carson Wentz (Questionable); T.J. Hockenson (Questionable); Jay Ward (Questionable); Kyler Murray (Doubtful) | GB: Kevin Zeitler (Questionable); Travis Glover (Questionable); Aaron Banks (Questionable); Sean Rhyan (Questionable); Zaire Franklin (Doubtful); Savion Williams (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 44F, precip 0%, wind 1/gust 1 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open -4.5 -> current -3 (home); total open 45.5 -> current 41.5 (trend -8.8%); drivers: model-market spread divergence 0.16 pts (item 10); explosive-play matchup 4.7% vs 3.4% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 30.0% vs 35.0% (item 5)
10. Model vs market — model home spread -2.84 vs mkt -3, edge 0.16 pts; total model 42.3 vs 41.5 (edge 0.75); EPA margin 6.12 over 66 snaps/team
11. Assumptions — SRS=-0.43 pts component + EPA rate margin x 66 snaps = 6.12 pts component -> blend 2.84; D-EPA rank #27 (GB) vs #32 (MIN); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873060; ESPN injuries API; open-meteo forecast (Lambeau Field).

## MIA @ IND — kickoff 2026-11-15T18:00Z

MIA 1-7 at IND 2-7. Model margin home-ago 1.73 pts (SRS 2.87, EPA 0.60) vs market home spread -3.5 -> edge 1.77; net EPA/play -0.008 vs -0.023; D-EPA #5/6; 3rdD 33.3%/36.3%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873059), ESPN injuries API, open-meteo (>=5).

**Pick:** IND win — confidence 60/100 (model margin 1.7 pts)

1. Rest/form/luck — rest 7/7d; last5 L-L-W-L-L/L-L-L-L-L; QBs Malik Willis (approx rating 6.0) / Daniel Jones (4.6); sack% allowed 10.3/7.6; TO luck A: fumble luck 2/8 vs 50% baseline; INT 10 on 15 PBU vs league-expected 2.49 (league INT:PBU ratio r=0.166); H: fumble luck 4/8 vs 50% baseline; INT 6 on 43 PBU vs league-expected 7.14 (league INT:PBU ratio r=0.166)
2. EPA/play — MIA off -0.090 / def -0.068; IND off -0.079 / def -0.070
3. Model — SRS -8.99 vs -6.62, HFA 0.50, projected margin 1.73 (SRS comp 2.87 + EPA comp 0.60)
4. Explosive — MIA 4.7% gen / 4.8% allowed; IND 4.1% / 6.4%
5. Third down/pass rush — conv 36.3% (MIA) vs 33.3% (IND); stops 66.7%/63.7%; sack rate 10.4%/7.3%
6. Top-3 — MIA: Caleb Douglas (WR), Malik Willis (QB), Greg Dulcich (TE) | IND: Josh Downs (WR), Mo Alie-Cox (TE), Seth McGowan (RB); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — MIA: Jared Wayne (Questionable); Chris Bell (Questionable); Darrell Baker Jr. (Out); Will Kacmarek (Questionable); Malik Herring (Questionable); Tucker Addington (Questionable) | IND: Jerry Tillery (Questionable); Akeem Davis-Gaither (Questionable); Mo Alie-Cox (Questionable); Luke Rhodes (Questionable); Jalen Travis (Doubtful)
8. Weather/roof — retractable-roof stadium; kickoff status not confirmable from free feeds — assumed closed, forecast sampled for reference only; T n/aF, precip n/a%, wind n/a/gust n/a mph; impact: no material weather impact (roofed/assumed-closed venue)
9. Market — spread open -6.5 -> current -3.5 (home); total open 47.5 -> current 38.5 (trend -18.9%); drivers: model-market spread divergence 1.77 pts (item 10); explosive-play matchup 4.7% vs 6.4% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 36.3% vs 33.3% (item 5)
10. Model vs market — model home spread -1.73 vs mkt -3.5, edge 1.77 pts; total model 36.2 vs 38.5 (edge -2.31); EPA margin 0.60 over 66 snaps/team
11. Assumptions — SRS=2.87 pts component + EPA rate margin x 66 snaps = 0.60 pts component -> blend 1.73; D-EPA rank #5 (IND) vs #6 (MIA); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873059; ESPN injuries API; open-meteo forecast (Lucas Oil Stadium).

## CAR @ NO — kickoff 2026-11-15T18:00Z

CAR 3-5 at NO 3-5. Model margin home-ago -2.98 pts (SRS -0.11, EPA -5.85) vs market home spread -2.5 -> edge 5.48; net EPA/play -0.010 vs 0.129; D-EPA #9/4; 3rdD 41.6%/34.0%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873055), ESPN injuries API, open-meteo (>=5).

**Pick:** CAR win — confidence 70/100 (model margin 3.0 pts)

1. Rest/form/luck — rest 7/7d; last5 W-W-L-L-L/L-L-W-L-W; QBs Bryce Young (approx rating 7.3) / Tyler Shough (6.5); sack% allowed 7.7/6.1; TO luck A: fumble luck 4/13 vs 50% baseline; INT 6 on 40 PBU vs league-expected 6.64 (league INT:PBU ratio r=0.166); H: fumble luck 3/8 vs 50% baseline; INT 6 on 30 PBU vs league-expected 4.98 (league INT:PBU ratio r=0.166)
2. EPA/play — CAR off 0.058 / def -0.071; NO off -0.053 / def -0.043
3. Model — SRS -3.13 vs -3.73, HFA 0.50, projected margin -2.98 (SRS comp -0.11 + EPA comp -5.85)
4. Explosive — CAR 6.0% gen / 3.9% allowed; NO 4.1% / 6.0%
5. Third down/pass rush — conv 34.0% (CAR) vs 41.6% (NO); stops 58.4%/66.0%; sack rate 7.6%/6.3%
6. Top-3 — CAR: Bryce Young (QB), Tetairoa McMillan (WR), Chuba Hubbard (RB) | NO: Tyler Shough (QB), Chris Olave (WR), Juwan Johnson (TE); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — CAR: Bobby Okereke (Questionable) | NO: Taliese Fuaga (Questionable); David Edwards (Questionable); Kelvin Banks Jr. (Questionable); Quincy Riley (Questionable); CJ Donaldson (Questionable); Christen Miller (Questionable)
8. Weather/roof — closed dome / retractable roof (nflverse games.csv roof=dome) [nflverse games.csv roof=dome]; T 66F, precip 0%, wind 3/gust 4 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open -1.5 -> current -2.5 (home); total open 43.5 -> current 48.5 (trend 11.5%); drivers: model-market spread divergence 5.48 pts (item 10); explosive-play matchup 6.0% vs 6.0% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 34.0% vs 41.6% (item 5)
10. Model vs market — model home spread 2.98 vs mkt -2.5, edge 5.48 pts; total model 48.0 vs 48.5 (edge -0.5); EPA margin -5.85 over 70 snaps/team
11. Assumptions — SRS=-0.11 pts component + EPA rate margin x 70 snaps = -5.85 pts component -> blend -2.98; D-EPA rank #9 (NO) vs #4 (CAR); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873055; ESPN injuries API; open-meteo forecast (Caesars Superdome).

## BUF @ NYJ — kickoff 2026-11-15T18:00Z

BUF 7-1 at NYJ 2-7. Model margin home-ago -11.72 pts (SRS -12.30, EPA -11.15) vs market home spread 8.5 -> edge 3.22; net EPA/play 0.034 vs 0.119; D-EPA #14/17; 3rdD 32.8%/40.4%; ST trigger true. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873054), ESPN injuries API, open-meteo (>=5).

**Pick:** BUF win — confidence 65/100 (model margin 11.7 pts)

1. Rest/form/luck — rest 6/7d; last5 L-W-W-W-W/W-L-L-L-L; QBs Josh Allen (approx rating 8.5) / Geno Smith (8.1); sack% allowed 6.7/9.4; TO luck A: fumble luck 6/8 vs 50% baseline; INT 3 on 48 PBU vs league-expected 7.97 (league INT:PBU ratio r=0.166); H: fumble luck 8/11 vs 50% baseline; INT 6 on 29 PBU vs league-expected 4.82 (league INT:PBU ratio r=0.166)
2. EPA/play — BUF off 0.132 / def 0.012; NYJ off 0.011 / def -0.024
3. Model — SRS 8.23 vs -4.56, HFA 0.50, projected margin -11.72 (SRS comp -12.30 + EPA comp -11.15)
4. Explosive — BUF 7.1% gen / 5.6% allowed; NYJ 5.0% / 4.7%
5. Third down/pass rush — conv 40.4% (BUF) vs 32.8% (NYJ); stops 67.2%/59.6%; sack rate 6.7%/9.5%
6. Top-3 — BUF: Josh Allen (QB), Dalton Kincaid (TE), Keon Coleman (WR) | NYJ: Geno Smith (QB), Garrett Wilson (WR), Mason Taylor (TE); ST: ST edge: BUF coverage/kicking unit (0.202 EPA/snap, blocks 0)
7. Injuries — BUF: Sam Franklin Jr. (Questionable); Dalton Kincaid (Questionable); Dion Dawkins (Questionable); Christian Benford (Questionable); Spencer Brown (Questionable); Connor McGovern (Questionable) | NYJ: Garrett Wilson (Questionable); Omar Cooper Jr. (Questionable); Harrison Phillips (Questionable); Nahshon Wright (Questionable); Joseph Ossai (Questionable); Trevin Wallace (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 46F, precip 0%, wind 4/gust 6 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open 7 -> current 8.5 (home); total open 46.5 -> current 50.5 (trend 8.6%); drivers: model-market spread divergence 3.22 pts (item 10); explosive-play matchup 7.1% vs 4.7% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 40.4% vs 32.8% (item 5)
10. Model vs market — model home spread 11.72 vs mkt 8.5, edge 3.22 pts; total model 52.2 vs 50.5 (edge 1.72); EPA margin -11.15 over 71 snaps/team
11. Assumptions — SRS=-12.30 pts component + EPA rate margin x 71 snaps = -11.15 pts component -> blend -11.72; D-EPA rank #14 (NYJ) vs #17 (BUF); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873054; ESPN injuries API; open-meteo forecast (MetLife Stadium).

## JAX @ TEN — kickoff 2026-11-15T18:00Z

JAX 6-2 at TEN 1-7. Model margin home-ago -22.49 pts (SRS -18.95, EPA -26.03) vs market home spread 10.5 -> edge 11.99; net EPA/play 0.000 vs 0.014; D-EPA #7/31; 3rdD 33.3%/44.9%; ST trigger true. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873057), ESPN injuries API, open-meteo (>=5).

**Pick:** JAX win — confidence 70/100 (model margin 22.5 pts)

1. Rest/form/luck — rest 10/14d; last5 W-W-L-W-W/L-L-W-L-L; QBs Trevor Lawrence (approx rating 9.4) / Cam Ward (5.6); sack% allowed 5.4/5.0; TO luck A: fumble luck 3/10 vs 50% baseline; INT 5 on 36 PBU vs league-expected 5.98 (league INT:PBU ratio r=0.166); H: fumble luck 3/6 vs 50% baseline; INT 4 on 26 PBU vs league-expected 4.32 (league INT:PBU ratio r=0.166)
2. EPA/play — JAX off 0.160 / def 0.147; TEN off -0.067 / def -0.067
3. Model — SRS 12.91 vs -6.53, HFA 0.50, projected margin -22.49 (SRS comp -18.95 + EPA comp -26.03)
4. Explosive — JAX 6.1% gen / 4.3% allowed; TEN 4.9% / 5.8%
5. Third down/pass rush — conv 44.9% (JAX) vs 33.3% (TEN); stops 66.7%/55.1%; sack rate 5.4%/3.5%
6. Top-3 — JAX: Trevor Lawrence (QB), Parker Washington (WR), Bhayshul Tuten (RB) | TEN: Carnell Tate (WR), Cam Ward (QB), Gunnar Helm (TE); ST: ST edge: JAX coverage/kicking unit (0.152 EPA/snap, blocks 0)
7. Injuries — JAX: Travon Walker (Questionable); Jakobi Meyers (Questionable); Chris Rodriguez Jr. (Questionable); Bhayshul Tuten (Questionable); Antonio Johnson (Questionable); Branson Combs (Questionable) | TEN: Tyjae Spears (Questionable); Tony Pollard (Questionable); Carnell Tate (Questionable); Kevin Winston Jr. (Questionable); Cody Barton (Questionable); Anthony Hill Jr. (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 53F, precip 0%, wind 1/gust 2 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open 2.5 -> current 10.5 (home); total open 45.5 -> current 46.5 (trend 2.2%); drivers: model-market spread divergence 11.99 pts (item 10); explosive-play matchup 6.1% vs 5.8% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 44.9% vs 33.3% (item 5)
10. Model vs market — model home spread 22.49 vs mkt 10.5, edge 11.99 pts; total model 46.6 vs 46.5 (edge 0.13); EPA margin -26.03 over 59 snaps/team
11. Assumptions — SRS=-18.95 pts component + EPA rate margin x 59 snaps = -26.03 pts component -> blend -22.49; D-EPA rank #7 (TEN) vs #31 (JAX); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873057; ESPN injuries API; open-meteo forecast (Nissan Stadium).

## LA @ ARI — kickoff 2026-11-15T21:05Z

LA 5-4 at ARI 3-6. Model margin home-ago -13.85 pts (SRS -11.01, EPA -16.68) vs market home spread 9.5 -> edge 4.35; net EPA/play 0.013 vs -0.040; D-EPA #8/28; 3rdD 33.3%/38.4%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873061), ESPN injuries API, open-meteo (>=5).

**Pick:** LA win — confidence 68/100 (model margin 13.8 pts)

1. Rest/form/luck — rest 7/7d; last5 L-L-W-W-W/L-W-L-W-L; QBs Matthew Stafford (approx rating 6.6) / Gardner Minshew (7.8); sack% allowed 3.6/6.0; TO luck A: fumble luck 2/4 vs 50% baseline; INT 7 on 49 PBU vs league-expected 8.14 (league INT:PBU ratio r=0.166); H: fumble luck 4/7 vs 50% baseline; INT 9 on 38 PBU vs league-expected 6.31 (league INT:PBU ratio r=0.166)
2. EPA/play — LA off 0.043 / def 0.083; ARI off -0.043 / def -0.056
3. Model — SRS 3.83 vs -7.68, HFA 0.50, projected margin -13.85 (SRS comp -11.01 + EPA comp -16.68)
4. Explosive — LA 4.7% gen / 4.5% allowed; ARI 3.7% / 5.2%
5. Third down/pass rush — conv 38.4% (LA) vs 33.3% (ARI); stops 66.7%/61.6%; sack rate 3.8%/6.0%
6. Top-3 — LA: Matthew Stafford (QB), Puka Nacua (WR), Blake Corum (RB) | ARI: Trey McBride (TE), Jacoby Brissett (QB), Michael Wilson (WR); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — LA: Trent McDuffie (Questionable); Davis Allen (Questionable); Colby Parkinson (Questionable); Tyler Higbee (Questionable); Myles Garrett (Questionable); Kam Curl (Questionable) | ARI: Jayden Williams (Questionable); Andrew Wingard (Questionable); Bam Knight (Questionable); Darius Robinson (Questionable); Dante Stills (Questionable); Max Melton (Questionable)
8. Weather/roof — retractable-roof stadium; kickoff status not confirmable from free feeds — assumed closed, forecast sampled for reference only; T n/aF, precip n/a%, wind n/a/gust n/a mph; impact: no material weather impact (roofed/assumed-closed venue)
9. Market — spread open 10.5 -> current 9.5 (home); total open 47.5 -> current 39.5 (trend -16.8%); drivers: model-market spread divergence 4.35 pts (item 10); explosive-play matchup 4.7% vs 5.2% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 38.4% vs 33.3% (item 5)
10. Model vs market — model home spread 13.85 vs mkt 9.5, edge 4.35 pts; total model 43.6 vs 39.5 (edge 4.06); EPA margin -16.68 over 74 snaps/team
11. Assumptions — SRS=-11.01 pts component + EPA rate margin x 74 snaps = -16.68 pts component -> blend -13.85; D-EPA rank #8 (ARI) vs #28 (LA); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873061; ESPN injuries API; open-meteo forecast (State Farm Stadium).

## SEA @ LV — kickoff 2026-11-15T21:05Z

SEA 5-4 at LV 4-5. Model margin home-ago -8.00 pts (SRS -6.67, EPA -9.33) vs market home spread 6.5 -> edge 1.5; net EPA/play 0.096 vs -0.134; D-EPA #2/29; 3rdD 39.3%/33.3%; ST trigger true. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873062), ESPN injuries API, open-meteo (>=5).

**Pick:** SEA win — confidence 60/100 (model margin 8.0 pts)

1. Rest/form/luck — rest 7/7d; last5 L-L-W-L-W/L-L-L-W-L; QBs Sam Darnold (approx rating 6.0) / Fernando Mendoza (n/a); sack% allowed 6.2/3.3; TO luck A: fumble luck 3/8 vs 50% baseline; INT 8 on 35 PBU vs league-expected 5.81 (league INT:PBU ratio r=0.166); H: fumble luck 7/8 vs 50% baseline; INT 9 on 33 PBU vs league-expected 5.48 (league INT:PBU ratio r=0.166)
2. EPA/play — SEA off -0.039 / def 0.095; LV off 0.006 / def -0.090
3. Model — SRS 3.82 vs -3.34, HFA 0.50, projected margin -8.00 (SRS comp -6.67 + EPA comp -9.33)
4. Explosive — SEA 4.8% gen / 2.9% allowed; LV 5.3% / 6.1%
5. Third down/pass rush — conv 33.3% (SEA) vs 39.3% (LV); stops 60.7%/66.7%; sack rate 6.4%/2.8%
6. Top-3 — SEA: Jaxon Smith-Njigba (WR), Drew Lock (QB), Brady Russell (RB) | LV: Kirk Cousins (QB), Brock Bowers (TE), Tre Tucker (WR); ST: ST edge: SEA coverage/kicking unit (0.258 EPA/snap, blocks 0)
7. Injuries — SEA: Drew Lock (Questionable); Derick Hall (Questionable); Leonard Williams (Questionable); Connor O'Toole (Questionable); Patrick O'Connell (Questionable); Anthony Bradford (Questionable) | LV: Trey Zuhn III (Questionable); Thomas Booker IV (Questionable)
8. Weather/roof — closed dome / retractable roof (nflverse games.csv roof=dome) [nflverse games.csv roof=dome]; T 64F, precip 0%, wind 1/gust 2 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open 7 -> current 6.5 (home); total open 43.5 -> current 40.5 (trend -6.9%); drivers: model-market spread divergence 1.5 pts (item 10); explosive-play matchup 4.8% vs 6.1% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 33.3% vs 39.3% (item 5)
10. Model vs market — model home spread 8 vs mkt 6.5, edge 1.5 pts; total model 48.9 vs 40.5 (edge 8.39); EPA margin -9.33 over 67 snaps/team
11. Assumptions — SRS=-6.67 pts component + EPA rate margin x 67 snaps = -9.33 pts component -> blend -8.00; D-EPA rank #2 (LV) vs #29 (SEA); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873062; ESPN injuries API; open-meteo forecast (Allegiant Stadium).

## SF @ DAL — kickoff 2026-11-15T21:25Z

SF 7-1 at DAL 4-5. Model margin home-ago -11.02 pts (SRS -7.47, EPA -14.58) vs market home spread 3.5 -> edge 7.52; net EPA/play 0.178 vs 0.162; D-EPA #1/19; 3rdD 40.2%/48.2%; ST trigger true. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873063), ESPN injuries API, open-meteo (>=5).

**Pick:** SF win — confidence 70/100 (model margin 11.0 pts)

1. Rest/form/luck — rest 7/7d; last5 W-W-W-L-W/L-L-W-L-W; QBs Brock Purdy (approx rating 8.9) / Dak Prescott (7.4); sack% allowed 3.3/4.0; TO luck A: fumble luck 5/6 vs 50% baseline; INT 5 on 25 PBU vs league-expected 4.15 (league INT:PBU ratio r=0.166); H: fumble luck 4/5 vs 50% baseline; INT 5 on 34 PBU vs league-expected 5.65 (league INT:PBU ratio r=0.166)
2. EPA/play — SF off 0.176 / def 0.014; DAL off 0.080 / def -0.098
3. Model — SRS 9.05 vs 1.08, HFA 0.50, projected margin -11.02 (SRS comp -7.47 + EPA comp -14.58)
4. Explosive — SF 6.4% gen / 3.4% allowed; DAL 5.0% / 6.6%
5. Third down/pass rush — conv 48.2% (SF) vs 40.2% (DAL); stops 59.8%/51.8%; sack rate 3.5%/4.0%
6. Top-3 — SF: Brock Purdy (QB), Mike Evans (WR), Christian McCaffrey (RB) | DAL: Dak Prescott (QB), CeeDee Lamb (WR), Javonte Williams (RB); ST: ST edge: SF coverage/kicking unit (0.196 EPA/snap, blocks 0)
7. Injuries — SF: Dre Greenlaw (Questionable); Mike Evans (Questionable); Trent Williams (Questionable); Deebo Samuel Sr. (Questionable); Deommodore Lenoir (Questionable); Renardo Green (Questionable) | DAL: Jonathan Mingo (Questionable); KaVontae Turpin (Questionable); Juanyeh Thomas (Questionable); Alijah Clark (Questionable); George Pickens (Questionable); Joey Porter Jr. (Questionable)
8. Weather/roof — retractable-roof stadium; kickoff status not confirmable from free feeds — assumed closed, forecast sampled for reference only; T n/aF, precip n/a%, wind n/a/gust n/a mph; impact: no material weather impact (roofed/assumed-closed venue)
9. Market — spread open -1.5 -> current 3.5 (home); total open 52.5 -> current 55.5 (trend 5.7%); drivers: model-market spread divergence 7.52 pts (item 10); explosive-play matchup 6.4% vs 6.6% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 48.2% vs 40.2% (item 5)
10. Model vs market — model home spread 11.02 vs mkt 3.5, edge 7.52 pts; total model 56.7 vs 55.5 (edge 1.21); EPA margin -14.58 over 70 snaps/team
11. Assumptions — SRS=-7.47 pts component + EPA rate margin x 70 snaps = -14.58 pts component -> blend -11.02; D-EPA rank #1 (DAL) vs #19 (SF); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873063; ESPN injuries API; open-meteo forecast (AT&T Stadium).

## PIT @ CIN — kickoff 2026-11-16T01:20Z

PIT 6-2 at CIN 6-2. Model margin home-ago 6.19 pts (SRS 4.32, EPA 8.06) vs market home spread -3.5 -> edge -2.69; net EPA/play 0.170 vs -0.068; D-EPA #16/25; 3rdD 48.5%/35.2%; ST trigger true. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873064), ESPN injuries API, open-meteo (>=5).

**Pick:** CIN win — confidence 63/100 (model margin 6.2 pts)

1. Rest/form/luck — rest 14/7d; last5 L-W-W-W-W/L-W-W-W-W; QBs Aaron Rodgers (approx rating 6.5) / Joe Burrow (8.7); sack% allowed 7.3/4.8; TO luck A: fumble luck 5/5 vs 50% baseline; INT 6 on 50 PBU vs league-expected 8.31 (league INT:PBU ratio r=0.166); H: fumble luck 7/6 vs 50% baseline; INT 6 on 34 PBU vs league-expected 5.65 (league INT:PBU ratio r=0.166)
2. EPA/play — PIT off -0.025 / def 0.043; CIN off 0.152 / def -0.018
3. Model — SRS 3.72 vs 7.54, HFA 0.50, projected margin 6.19 (SRS comp 4.32 + EPA comp 8.06)
4. Explosive — PIT 5.9% gen / 6.5% allowed; CIN 5.4% / 7.1%
5. Third down/pass rush — conv 35.2% (PIT) vs 48.5% (CIN); stops 51.5%/64.8%; sack rate 7.1%/4.8%
6. Top-3 — PIT: Jaylen Warren (RB), Pat Freiermuth (TE), Roman Wilson (WR) | CIN: Joe Burrow (QB), Tee Higgins (WR), Mike Gesicki (TE); ST: ST edge: PIT coverage/kicking unit (0.164 EPA/snap, blocks 0)
7. Injuries — PIT: none listed | CIN: Kyle Dugger (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 46F, precip 0%, wind 1/gust 1 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open -3.5 -> current -3.5 (home); total open 47.5 -> current 49.5 (trend 4.2%); drivers: model-market spread divergence -2.69 pts (item 10); explosive-play matchup 5.9% vs 7.1% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 35.2% vs 48.5% (item 5)
10. Model vs market — model home spread -6.19 vs mkt -3.5, edge -2.69 pts; total model 52.5 vs 49.5 (edge 3); EPA margin 8.06 over 70 snaps/team
11. Assumptions — SRS=4.32 pts component + EPA rate margin x 70 snaps = 8.06 pts component -> blend 6.19; D-EPA rank #16 (CIN) vs #25 (PIT); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873064; ESPN injuries API; open-meteo forecast (Paycor Stadium).

## LAC @ BAL — kickoff 2026-11-17T01:15Z

LAC 0-8 at BAL 4-5. Model margin home-ago 10.55 pts (SRS 7.57, EPA 13.52) vs market home spread -4.5 -> edge -6.05; net EPA/play 0.020 vs -0.302; D-EPA #13/24; 3rdD 31.7%/31.0%; ST trigger false. Sources: nflverse play_by_play, nflverse stats_team_week, nflverse stats_player_reg, nflverse games.csv, ESPN scoreboard (401873065), ESPN injuries API, open-meteo (>=5).

**Pick:** BAL win — confidence 70/100 (model margin 10.5 pts)

1. Rest/form/luck — rest 8/11d; last5 L-L-L-L-L/W-L-L-L-L; QBs Justin Herbert (approx rating 5.2) / Tyler Huntley (6.9); sack% allowed 11.3/8.5; TO luck A: fumble luck 4/8 vs 50% baseline; INT 5 on 26 PBU vs league-expected 4.32 (league INT:PBU ratio r=0.166); H: fumble luck 5/14 vs 50% baseline; INT 11 on 33 PBU vs league-expected 5.48 (league INT:PBU ratio r=0.166)
2. EPA/play — LAC off -0.269 / def 0.033; BAL off -0.004 / def -0.024
3. Model — SRS -12.09 vs -5.01, HFA 0.50, projected margin 10.55 (SRS comp 7.57 + EPA comp 13.52)
4. Explosive — LAC 3.8% gen / 5.0% allowed; BAL 5.1% / 5.3%
5. Third down/pass rush — conv 31.0% (LAC) vs 31.7% (BAL); stops 68.3%/69.0%; sack rate 10.8%/8.4%
6. Top-3 — LAC: Ladd McConkey (WR), Hayden Rucci (TE), DJ Uiagalelei (QB) | BAL: Lamar Jackson (QB), Zay Flowers (WR), Josh Cuevas (TE); ST: no ST edge beyond trigger (both units within +/-0.15 EPA/snap)
7. Injuries — LAC: Brenen Thompson (Questionable); Tre' Harris (Questionable); Keaton Mitchell (Questionable); Rodney Shelley (Questionable); Cam Hart (Questionable); Branson Taylor (Questionable) | BAL: Jaylinn Hawkins (Questionable); Rashod Bateman (Questionable); Olaivavega Ioane (Questionable); Adisa Isaac (Questionable)
8. Weather/roof — open-air [nflverse games.csv roof=outdoors]; T 46F, precip 0%, wind 2/gust 5 mph; impact: mild conditions — no game-shaping impact expected
9. Market — spread open -2.5 -> current -4.5 (home); total open 48.5 -> current 38.5 (trend -20.6%); drivers: model-market spread divergence -6.05 pts (item 10); explosive-play matchup 3.8% vs 5.3% (item 4); turnover-luck regression + availability (items 1/7); third-down edge 31.0% vs 31.7% (item 5)
10. Model vs market — model home spread -10.55 vs mkt -4.5, edge -6.05 pts; total model 36.1 vs 38.5 (edge -2.37); EPA margin 13.52 over 65 snaps/team
11. Assumptions — SRS=7.57 pts component + EPA rate margin x 65 snaps = 13.52 pts component -> blend 10.55; D-EPA rank #13 (BAL) vs #24 (LAC); HFA=0.50; limits: see JSON dossier

Sources (>=5): nflverse play_by_play_2026; nflverse stats_team_week_2026; nflverse stats_player_reg_2026; nflverse schedules games.csv; ESPN scoreboard API event 401873065; ESPN injuries API; open-meteo forecast (M&T Bank Stadium).
