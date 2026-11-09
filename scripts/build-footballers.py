import csv
import json
import re
from datetime import datetime
import unicodedata

# 1. Complete League Mapping from Transfermarkt Competitions
LEAGUE_MAP = {
    'GB1': 'Premier League',
    'ES1': 'La Liga',
    'IT1': 'Serie A',
    'L1': 'Bundesliga',
    'FR1': 'Ligue 1',
    'SA1': 'Saudi Pro',
    'MLS1': 'MLS',
    'PO1': 'Primeira Liga',
    'NL1': 'Eredivisie',
    'BRA1': 'Brasileirão',
    'ARG1': 'Argentine Primera',
    'TR1': 'Süper Lig',
    'SC1': 'Scottish Premiership',
    'BE1': 'Belgian Pro',
    'RU1': 'Russian Premier League',
    'UKR1': 'Ukrainian Premier League',
    'GR1': 'Super League Greece',
    'DK1': 'Danish Superliga',
    'MEX1': 'Liga MX',
    'C1': 'Swiss Super League',
    'A1': 'Austrian Bundesliga',
    'KR1': 'Croatian HNL',
    'SER1': 'Serbian SuperLiga',
    'PL1': 'Ekstraklasa',
    'RO1': 'Romanian SuperLiga',
    'TS1': 'Czech First League',
    'SE1': 'Allsvenskan',
    'NO1': 'Eliteserien',
    'JAP1': 'J1 League',
    'RSK1': 'K League 1',
    'AUS1': 'A-League',
}

# 2. Comprehensive Country Name -> (ISO Code, Flag Emoji, Confederation/Normalized)
COUNTRY_MAP = {
    'Argentina': ('AR', '🇦🇷'),
    'Portugal': ('PT', '🇵🇹'),
    'France': ('FR', '🇫🇷'),
    'Norway': ('NO', '🇳🇴'),
    'Belgium': ('BE', '🇧🇪'),
    'Croatia': ('HR', '🇭🇷'),
    'England': ('GB-ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
    'Brazil': ('BR', '🇧🇷'),
    'Egypt': ('EG', '🇪🇬'),
    'Poland': ('PL', '🇵🇱'),
    'Netherlands': ('NL', '🇳🇱'),
    'Spain': ('ES', '🇪🇸'),
    'Germany': ('DE', '🇩🇪'),
    'Italy': ('IT', '🇮🇹'),
    'South Korea': ('KR', '🇰🇷'),
    'Korea, South': ('KR', '🇰🇷'),
    'Cote d\'Ivoire': ('CI', '🇨🇮'),
    'Ivory Coast': ('CI', '🇨🇮'),
    'Cameroon': ('CM', '🇨🇲'),
    'Wales': ('GB-WLS', '🏴󠁧󠁢󠁷󠁬󠁳󠁿'),
    'Uruguay': ('UY', '🇺🇾'),
    'Denmark': ('DK', '🇩🇰'),
    'Sweden': ('SE', '🇸🇪'),
    'Switzerland': ('CH', '🇨🇭'),
    'Senegal': ('SN', '🇸🇳'),
    'Nigeria': ('NG', '🇳🇬'),
    'Morocco': ('MA', '🇲🇦'),
    'Algeria': ('DZ', '🇩🇿'),
    'Ghana': ('GH', '🇬🇭'),
    'Colombia': ('CO', '🇨🇴'),
    'Chile': ('CL', '🇨🇱'),
    'United States': ('US', '🇺🇸'),
    'Canada': ('CA', '🇨🇦'),
    'Japan': ('JP', '🇯🇵'),
    'Australia': ('AU', '🇦🇺'),
    'Mexico': ('MX', '🇲🇽'),
    'Serbia': ('RS', '🇷🇸'),
    'Austria': ('AT', '🇦🇹'),
    'Czech Republic': ('CZ', '🇨🇿'),
    'Czechia': ('CZ', '🇨🇿'),
    'Scotland': ('GB-SCT', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
    'Turkey': ('TR', '🇹🇷'),
    'Türkiye': ('TR', '🇹🇷'),
    'Ukraine': ('UA', '🇺🇦'),
    'Georgia': ('GE', '🇬🇪'),
    'Slovenia': ('SI', '🇸🇮'),
    'Slovakia': ('SK', '🇸🇰'),
    'Hungary': ('HU', '🇭🇺'),
    'Greece': ('GR', '🇬🇷'),
    'Romania': ('RO', '🇷🇴'),
    'Ecuador': ('EC', '🇪🇨'),
    'Venezuela': ('VE', '🇻🇪'),
    'Paraguay': ('PY', '🇵🇾'),
    'Peru': ('PE', '🇵🇪'),
    'Mali': ('ML', '🇲🇱'),
    'Bosnia-Herzegovina': ('BA', '🇧🇦'),
    'Northern Ireland': ('GB-NIR', '🇬🇧'),
    'Republic of Ireland': ('IE', '🇮🇪'),
    'Ireland': ('IE', '🇮🇪'),
    'Russia': ('RU', '🇷🇺'),
    'Democratic Republic of the Congo': ('CD', '🇨🇩'),
    'DR Congo': ('CD', '🇨🇩'),
    'Congo DR': ('CD', '🇨🇩'),
    'Congo': ('CG', '🇨🇬'),
    'Guinea': ('GN', '🇬🇳'),
    'Albania': ('AL', '🇦🇱'),
    'Kosovo': ('XK', '🇽🇰'),
    'North Macedonia': ('MK', '🇲🇰'),
    'Macedonia': ('MK', '🇲🇰'),
    'Finland': ('FI', '🇫🇮'),
    'Iceland': ('IS', '🇮🇸'),
    'Israel': ('IL', '🇮🇱'),
    'Iran': ('IR', '🇮🇷'),
    'Tunisia': ('TN', '🇹🇳'),
    'Costa Rica': ('CR', '🇨🇷'),
    'Jamaica': ('JM', '🇯🇲'),
    'South Africa': ('ZA', '🇿🇦'),
    'Burkina Faso': ('BF', '🇧🇫'),
    'Gabon': ('GA', '🇬🇦'),
    'Guinea-Bissau': ('GW', '🇬🇼'),
    'Cape Verde': ('CV', '🇨🇻'),
    'Equatorial Guinea': ('GQ', '🇬🇶'),
    'Suriname': ('SR', '🇸🇷'),
    'Honduras': ('HN', '🇭🇳'),
    'Panama': ('PA', '🇵🇦'),
    'Bulgaria': ('BG', '🇧🇬'),
    'Montenegro': ('ME', '🇲🇪'),
    'Cyprus': ('CY', '🇨🇾'),
    'Armenia': ('AM', '🇦🇲'),
    'Azerbaijan': ('AZ', '🇦🇿'),
    'Kazakhstan': ('KZ', '🇰🇿'),
    'Uzbekistan': ('UZ', '🇺🇿'),
    'Saudi Arabia': ('SA', '🇸🇦'),
    'United Arab Emirates': ('AE', '🇦🇪'),
    'Qatar': ('QA', '🇶🇦'),
    'New Zealand': ('NZ', '🇳🇿'),
    'Bolivia': ('BO', '🇧🇴'),
    'Luxembourg': ('LU', '🇱🇺'),
    'Angola': ('AO', '🇦🇴'),
    'Zimbabwe': ('ZW', '🇿🇼'),
    'Zambia': ('ZM', '🇿🇲'),
    'Gambia': ('GM', '🇬🇲'),
    'The Gambia': ('GM', '🇬🇲'),
    'Mozambique': ('MZ', '🇲🇿'),
    'Benin': ('BJ', '🇧🇯'),
    'Togo': ('TG', '🇹🇬'),
    'Sierra Leone': ('SL', '🇸🇱'),
    'Kenya': ('KE', '🇰🇪'),
    'Liberia': ('LR', '🇱🇷'),
    'Dominican Republic': ('DO', '🇩🇴'),
    'Indonesia': ('ID', '🇮🇩'),
    'Haiti': ('HT', '🇭🇹'),
    'Burundi': ('BI', '🇧🇮'),
    'Central African Republic': ('CF', '🇨🇫'),
    'Guadeloupe': ('GP', '🇬🇵'),
    'Syria': ('SY', '🇸🇾'),
    'Libya': ('LY', '🇱🇾'),
    'Trinidad and Tobago': ('TT', '🇹🇹'),
    'Trinidad & Tobago': ('TT', '🇹🇹'),
    'Curacao': ('CW', '🇨🇼'),
    'Curaçao': ('CW', '🇨🇼'),
    'New Caledonia': ('NC', '🇳🇨'),
    'Tanzania': ('TZ', '🇹🇿'),
    'Jordan': ('JO', '🇯🇴'),
    'Bangladesh': ('BD', '🇧🇩'),
    'Comoros': ('KM', '🇰🇲'),
    'China': ('CN', '🇨🇳'),
    'China PR': ('CN', '🇨🇳'),
}

# Explicit player nationality overrides for players missing country in Transfermarkt
PLAYER_NATIONALITY_OVERRIDES = {
    'radja-nainggolan': 'Belgium',
    'samir-handanovic': 'Slovenia',
    'haris-seferovic': 'Switzerland',
    'burak-yilmaz': 'Turkey',
    'fabio-quagliarella': 'Italy',
    'marvin-plattenhardt': 'Germany',
    'jese': 'Spain',
    'clement-grenier': 'France',
    'emiliano-viviano': 'Italy',
    'maarten-stekelenburg': 'Netherlands',
}

# Standardize country display variants
COUNTRY_NORM = {
    'Türkiye': 'Turkey',
    'Cote d\'Ivoire': 'Ivory Coast',
    'Côte d\'Ivoire': 'Ivory Coast',
    'Czechia': 'Czech Republic',
    'Democratic Republic of the Congo': 'DR Congo',
    'Congo DR': 'DR Congo',
    'The Gambia': 'Gambia',
    'Macedonia': 'North Macedonia',
    'Korea, South': 'South Korea',
    'Curaçao': 'Curacao',
    'China PR': 'China',
    'Trinidad & Tobago': 'Trinidad and Tobago',
}

POSITION_MAP = {
    'Attack': ('Forward', 'FWD'),
    'Midfield': ('Midfielder', 'MID'),
    'Defender': ('Defender', 'DEF'),
    'Goalkeeper': ('Goalkeeper', 'GK'),
}

CANONICAL_CLUBS = {
    'fc barcelona': 'Barcelona',
    'barcelona': 'Barcelona',
    'barca': 'Barcelona',
    'atletico de madrid': 'Atlético Madrid',
    'atletico madrid': 'Atlético Madrid',
    'atletico': 'Atlético Madrid',
    'real madrid cf': 'Real Madrid',
    'real madrid': 'Real Madrid',
    'manchester united': 'Manchester United',
    'man utd': 'Manchester United',
    'manchester city': 'Manchester City',
    'man city': 'Manchester City',
    'paris saint-germain': 'Paris Saint-Germain',
    'paris saint germain': 'Paris Saint-Germain',
    'psg': 'Paris Saint-Germain',
    'bayern munich': 'Bayern Munich',
    'bayern munchen': 'Bayern Munich',
    'bayern': 'Bayern Munich',
    'inter milan': 'Inter Milan',
    'internazionale': 'Inter Milan',
    'inter': 'Inter Milan',
    'ac milan': 'AC Milan',
    'milan': 'AC Milan',
    'juventus fc': 'Juventus',
    'juventus': 'Juventus',
    'juve': 'Juventus',
    'chelsea fc': 'Chelsea',
    'chelsea': 'Chelsea',
    'arsenal fc': 'Arsenal',
    'arsenal': 'Arsenal',
    'liverpool fc': 'Liverpool',
    'liverpool': 'Liverpool',
    'tottenham hotspur': 'Tottenham Hotspur',
    'tottenham': 'Tottenham Hotspur',
    'spurs': 'Tottenham Hotspur',
    'borussia dortmund': 'Borussia Dortmund',
    'dortmund': 'Borussia Dortmund',
    'bvb': 'Borussia Dortmund',
    'al-nassr fc': 'Al-Nassr',
    'al-nassr': 'Al-Nassr',
    'al nassr': 'Al-Nassr',
    'al-nassr football club': 'Al-Nassr',
    'al-hilal': 'Al-Hilal',
    'al hilal': 'Al-Hilal',
    'al-hilal saudi fc': 'Al-Hilal',
    'inter miami cf': 'Inter Miami',
    'inter miami': 'Inter Miami',
    'miami': 'Inter Miami',
    'club internacional de futbol miami': 'Inter Miami',
    'as roma': 'Roma',
    'roma': 'Roma',
    'ssc napoli': 'Napoli',
    'napoli': 'Napoli',
    'sporting cp': 'Sporting CP',
    'sporting lisbon': 'Sporting CP',
    'sporting': 'Sporting CP',
    'sl benfica': 'Benfica',
    'benfica': 'Benfica',
    'fc porto': 'Porto',
    'porto': 'Porto',
    'afc ajax': 'Ajax',
    'ajax amsterdam': 'Ajax',
    'ajax': 'Ajax',
    'leicester city': 'Leicester City',
    'leicester': 'Leicester City',
    'newcastle united': 'Newcastle United',
    'newcastle': 'Newcastle United',
    'aston villa': 'Aston Villa',
    'villa': 'Aston Villa',
    'west ham united': 'West Ham',
    'west ham': 'West Ham',
    'everton fc': 'Everton',
    'everton': 'Everton',
    'sevilla fc': 'Sevilla',
    'sevilla': 'Sevilla',
    'valencia cf': 'Valencia',
    'valencia': 'Valencia',
    'villarreal cf': 'Villarreal',
    'villarreal': 'Villarreal',
    'real sociedad': 'Real Sociedad',
    'athletic bilbao': 'Athletic Club',
    'athletic club': 'Athletic Club',
    'bayer 04 leverkusen': 'Bayer Leverkusen',
    'bayer leverkusen': 'Bayer Leverkusen',
    'rb leipzig': 'RB Leipzig',
    'leipzig': 'RB Leipzig',
    'eintracht frankfurt': 'Eintracht Frankfurt',
    'frankfurt': 'Eintracht Frankfurt',
    'vfl wolfsburg': 'VfL Wolfsburg',
    'wolfsburg': 'VfL Wolfsburg',
    'ss lazio': 'Lazio',
    'lazio': 'Lazio',
    'acf fiorentina': 'Fiorentina',
    'fiorentina': 'Fiorentina',
    'atalanta bc': 'Atalanta',
    'atalanta': 'Atalanta',
    'olympique de marseille': 'Marseille',
    'marseille': 'Marseille',
    'olympique lyonnais': 'Lyon',
    'lyon': 'Lyon',
    'as monaco': 'Monaco',
    'monaco': 'Monaco',
    'losc lille': 'Lille',
    'lille': 'Lille',
}

# Deceased players to exclude from game challenges
DECEASED_PLAYERS = {'emiliano-sala', 'christian-atsu'}

# Famous nicknames map
NICKNAMES = {
    'cristiano-ronaldo': ['CR7', 'Ronaldo'],
    'lionel-messi': ['Messi', 'Leo Messi', 'La Pulga'],
    'sergio-aguero': ['Kun Agüero', 'Kun Aguero', 'Aguero'],
    'fernando-torres': ['El Niño', 'El Nino'],
    'ronaldo-nazario': ['R9', 'O Fenômeno', 'O Fenomeno'],
    'diego-maradona': ['El Pibe de Oro', 'Maradona'],
    'pele': ['O Rei', 'Pele'],
    'kevin-de-bruyne': ['KDB'],
    'vinicius-junior': ['Vini Jr', 'Vini'],
    'javier-hernandez': ['Chicharito'],
    'alexis-sanchez': ['El Niño Maravilla'],
    'radamel-falcao': ['El Tigre'],
    'edinson-cavani': ['El Matador'],
    'luis-suarez': ['El Pistolero'],
}

def clean_slug(name):
    s = ''.join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def clean_club_name(name):
    if not name:
        return ''
    if re.search(r'\b(U\d+|Yth|Youth|Jgd|Sub-\d+|JV|Academy|II|B|C)\b', name, flags=re.IGNORECASE):
        return ''
    name = re.sub(r'\s+(S\.p\.A\.|F\.C\.|FC|CF|C\.F\.|SAD|plc|e\.V\.|LLC)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^(Società Sportiva|Associazione Calcio|Futbol Club|Club Internacional de Fútbol)\s+', '', name, flags=re.IGNORECASE)
    name = name.strip()
    k = name.lower()
    return CANONICAL_CLUBS.get(k, name)

print("1. Loading clubs lookup...")
club_id_to_name = {}
with open('data/transfermarkt/clubs.csv', mode='r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        club_id_to_name[row['club_id']] = clean_club_name(row.get('name', ''))

print("2. Loading chronological transfer events from transfers.csv...")
# Map: pid -> list of (date_str, club_name)
player_transfers_chronological = {}
with open('data/transfermarkt/transfers.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        pid = row['player_id']
        t_date = row.get('transfer_date') or '1970-01-01'
        from_club = clean_club_name(row.get('from_club_name', ''))
        to_club = clean_club_name(row.get('to_club_name', ''))
        
        if pid not in player_transfers_chronological:
            player_transfers_chronological[pid] = []
        if from_club and 'Without Club' not in from_club:
            player_transfers_chronological[pid].append((t_date, from_club))
        if to_club and 'Without Club' not in to_club:
            player_transfers_chronological[pid].append((t_date, to_club))

print("3. Augmenting match appearances chronologically from appearances.csv...")
with open('data/transfermarkt/appearances.csv', mode='r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        pid = row['player_id']
        app_date = row.get('date') or '1970-01-01'
        cid = row.get('player_club_id')
        if cid and cid in club_id_to_name:
            cname = club_id_to_name[cid]
            if cname:
                if pid not in player_transfers_chronological:
                    player_transfers_chronological[pid] = []
                player_transfers_chronological[pid].append((app_date, cname))

print("4. Parsing players from players.csv...")
players = []
now = datetime.now()

with open('data/transfermarkt/players.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get('name') or ''
        if not name:
            continue

        slug = clean_slug(name)
        if not slug or slug in DECEASED_PLAYERS:
            continue

        dob_str = row.get('date_of_birth') or ''
        age = 25
        if dob_str:
            try:
                dob_clean = dob_str.split()[0]
                dt = datetime.strptime(dob_clean, '%Y-%m-%d')
                age = now.year - dt.year - ((now.month, now.day) < (dt.month, dt.day))
            except:
                pass

        pos_raw = row.get('position', '')
        pos_info = POSITION_MAP.get(pos_raw)
        if not pos_info:
            continue
        position, position_abbr = pos_info

        highest_mv = int(row.get('highest_market_value_in_eur') or '0')
        current_mv = int(row.get('market_value_in_eur') or '0')
        last_season = int(row.get('last_season') or '0')

        if highest_mv < 5000000 and current_mv < 3000000:
            continue
        if last_season < 2018:
            continue

        current_club_raw = row.get('current_club_name', '')
        current_club = clean_club_name(current_club_raw)
        if not current_club or 'Retired' in current_club or 'Without Club' in current_club:
            continue

        comp_id = row.get('current_club_domestic_competition_id', '')
        league = LEAGUE_MAP.get(comp_id, 'Other League')

        # Country normalization
        if slug in PLAYER_NATIONALITY_OVERRIDES:
            country_raw = PLAYER_NATIONALITY_OVERRIDES[slug]
        else:
            country_raw = row.get('country_of_citizenship', '')
            if not country_raw:
                country_raw = row.get('country_of_birth', 'Unknown')
        country = COUNTRY_NORM.get(country_raw, country_raw)
        code, flag = COUNTRY_MAP.get(country, ('UN', '⚽'))

        # Build chronological previous clubs without duplicates
        pid = row['player_id']
        raw_timeline = player_transfers_chronological.get(pid, [])
        # Sort by date
        raw_timeline.sort(key=lambda x: x[0])

        norm_curr = current_club.lower()
        chronological_prev = []
        for _, c in raw_timeline:
            canon = clean_club_name(c)
            if not canon:
                continue
            norm_c = canon.lower()
            if norm_c == norm_curr or norm_c in norm_curr or norm_curr in norm_c:
                continue
            # Avoid immediate consecutive duplicates
            if not chronological_prev or chronological_prev[-1] != canon:
                chronological_prev.append(canon)

        # De-duplicate while preserving earliest-to-latest order
        seen_c = set()
        unique_ordered_prev = []
        for c in chronological_prev:
            if c not in seen_c:
                seen_c.add(c)
                unique_ordered_prev.append(c)

        previous_clubs = unique_ordered_prev[:8]

        # Alternative names (aliases & nicknames)
        alt_names = [name]
        if slug in NICKNAMES:
            for nick in NICKNAMES[slug]:
                if nick not in alt_names:
                    alt_names.append(nick)

        is_retired = (last_season <= 2023 and age >= 36)
        difficulty = 'Easy' if highest_mv >= 40000000 else ('Medium' if highest_mv >= 15000000 else 'Hard')
        image_url = row.get('image_url') or ''

        players.append({
            'id': slug,
            'fullName': name,
            'displayName': name,
            'alternativeNames': alt_names,
            'nationality': country,
            'countryCode': code,
            'flagEmoji': flag,
            'league': league,
            'position': position,
            'positionAbbr': position_abbr,
            'currentClub': current_club,
            'age': age,
            'isRetired': is_retired,
            'previousClubs': previous_clubs,
            'imageUrl': image_url,
            'difficulty': difficulty,
            'isActive': True,
            'highestMarketValue': highest_mv,
            'currentMarketValue': current_mv,
        })

# Import legends
try:
    import sys; sys.path.append('scripts')
    from legends_data import LEGENDS
except ImportError:
    LEGENDS = []

seen = set()
final_players = []

# Canonical exact ages for curated legends as of Nov 2026 (or age at death for deceased)
LEGEND_EXACT_AGES = {
    'diego-maradona': 60,       # Deceased (1960-2020)
    'pele': 82,                 # Deceased (1940-2022)
    'johan-cruyff': 68,         # Deceased (1947-2016)
    'franz-beckenbauer': 78,    # Deceased (1945-2024)
    'lev-yashin': 60,           # Deceased (1929-1990)
    'ferenc-puskas': 79,        # Deceased (1927-2006)
    'gerd-muller': 75,          # Deceased (1945-2021)
    'diego-godin': 40,
    'zinedine-zidane': 54,
    'ronaldo-nazario': 50,
    'ronaldinho': 46,
    'thierry-henry': 49,
    'paolo-maldini': 58,
    'roberto-carlos': 53,
    'cafu': 56,
    'kaka': 44,
    'andres-iniesta': 42,
    'xavi': 46,
    'andrea-pirlo': 47,
    'david-beckham': 51,
    'steven-gerrard': 46,
    'frank-lampard': 48,
    'paul-scholes': 51,
    'patrick-vieira': 50,
    'dennis-bergkamp': 57,
    'alan-shearer': 56,
    'wayne-rooney': 41,
    'didier-drogba': 48,
    'samuel-etoo': 45,
    'iker-casillas': 45,
    'gianluigi-buffon': 48,
    'peter-schmeichel': 62,
    'oliver-kahn': 57,
    'carles-puyol': 48,
    'alessandro-nesta': 50,
    'fabio-cannavaro': 53,
    'rio-ferdinand': 48,
    'sergio-aguero': 38,
    'raul': 49,
    'luis-figo': 54,
    'rivaldo': 54,
    'zlatan-ibrahimovic': 45,
    'gareth-bale': 37,
    'ruud-van-nistelrooy': 50,
    'andriy-shevchenko': 50,
    'clarence-seedorf': 50,
    'ruud-gullit': 64,
    'marco-van-basten': 62,
    'lothar-matthaus': 65,
    'romario': 60,
    'gabriel-batistuta': 57,
    'javier-zanetti': 53,
    'hristo-stoichkov': 60,
    'george-weah': 60,
    'franco-baresi': 66,
    'michel-platini': 71,
    'ronald-koeman': 63,
    'eric-cantona': 60,
    'michael-owen': 46,
    'fernando-torres': 42,
    'mesut-ozil': 38,
    'eden-hazard': 35,
}

# 1. Legends first (without achievements or clubAbbr, with verified ages)
for legend in LEGENDS:
    if legend['id'] not in seen:
        seen.add(legend['id'])
        clean_leg = dict(legend)
        clean_leg.pop('achievements', None)
        clean_leg.pop('clubAbbr', None)
        if clean_leg['id'] in LEGEND_EXACT_AGES:
            clean_leg['age'] = LEGEND_EXACT_AGES[clean_leg['id']]
        if clean_leg.get('league') == 'Top League':
            clean_leg['league'] = 'Other League'
        final_players.append(clean_leg)

# 2. Add modern players sorted by peak market value
players.sort(key=lambda p: (p['highestMarketValue'], p['currentMarketValue']), reverse=True)
for p in players:
    if p['id'] not in seen:
        seen.add(p['id'])
        del p['highestMarketValue']
        del p['currentMarketValue']
        final_players.append(p)
        if len(final_players) >= 3000:
            break

print(f"Total processed: {len(final_players)} footballers (including {len(LEGENDS)} icons).")
with open('src/data/footballers.json', 'w', encoding='utf-8') as f:
    json.dump(final_players, f, indent=2, ensure_ascii=False)

print("Saved cleanly to src/data/footballers.json!")
