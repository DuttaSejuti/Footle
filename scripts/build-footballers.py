import csv
import json
import re
from datetime import datetime

# 1. League Code to Clean Display Name Mapping
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
}

# 2. Country to ISO Code + Flag Emoji Mapping
COUNTRY_FLAGS = {
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
    'Scotland': ('GB-SCT', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
    'Turkey': ('TR', '🇹🇷'),
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
}

POSITION_MAP = {
    'Attack': ('Forward', 'FWD'),
    'Midfield': ('Midfielder', 'MID'),
    'Defender': ('Defender', 'DEF'),
    'Goalkeeper': ('Goalkeeper', 'GK'),
}

def clean_slug(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def clean_club_name(name):
    if not name:
        return ''
    # Remove common corporate/legal suffixes
    name = re.sub(r'\s+(S\.p\.A\.|F\.C\.|FC|CF|C\.F\.|SAD|plc|e\.V\.|LLC)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^(Società Sportiva|Associazione Calcio|Futbol Club)\s+', '', name, flags=re.IGNORECASE)
    return name.strip()

def make_abbr(name):
    words = re.findall(r'[a-zA-Z]+', name)
    if len(words) >= 2:
        return (words[0][0] + words[1][0] + (words[2][0] if len(words) > 2 else '')).upper()[:4]
    elif words:
        return words[0][:3].upper()
    return 'CLB'

print("1. Loading transfers...")
player_transfers = {}
with open('data/transfermarkt/transfers.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        pid = row['player_id']
        from_club = clean_club_name(row.get('from_club_name', ''))
        to_club = clean_club_name(row.get('to_club_name', ''))
        
        if pid not in player_transfers:
            player_transfers[pid] = set()
        if from_club and 'Without Club' not in from_club and 'Youth' not in from_club and 'U19' not in from_club and 'U17' not in from_club:
            player_transfers[pid].add(from_club)
        if to_club and 'Without Club' not in to_club and 'Youth' not in to_club and 'U19' not in to_club and 'U17' not in to_club:
            player_transfers[pid].add(to_club)

print("2. Parsing players...")
players = []
now_year = datetime.now().year

with open('data/transfermarkt/players.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get('name') or ''
        if not name:
            continue
        
        dob_str = row.get('date_of_birth') or ''
        age = 25
        if dob_str:
            try:
                birth_year = int(dob_str.split('-')[0])
                age = now_year - birth_year
            except:
                pass
        
        # Position mapping
        pos_raw = row.get('position', '')
        pos_info = POSITION_MAP.get(pos_raw)
        if not pos_info:
            continue
        position, position_abbr = pos_info

        # Market value filter for notoriety/fame
        highest_mv = int(row.get('highest_market_value_in_eur') or '0')
        current_mv = int(row.get('market_value_in_eur') or '0')
        last_season = int(row.get('last_season') or '0')

        # Only players with notable career market value (famous players)
        # and who played recently (active in modern era)
        if highest_mv < 5000000 and current_mv < 3000000:
            continue
        if last_season < 2018:
            continue

        current_club_raw = row.get('current_club_name', '')
        current_club = clean_club_name(current_club_raw)
        if not current_club or 'Retired' in current_club or 'Without Club' in current_club:
            continue

        comp_id = row.get('current_club_domestic_competition_id', '')
        league = LEAGUE_MAP.get(comp_id, 'Top League')

        country = row.get('country_of_citizenship', 'Unknown')
        code, flag = COUNTRY_FLAGS.get(country, ('UN', '⚽'))

        pid = row['player_id']
        all_clubs = player_transfers.get(pid, set())
        # Filter previous clubs (excluding current club)
        previous_clubs = [c for c in all_clubs if c.lower() != current_club.lower()][:8]

        image_url = row.get('image_url') or ''

        slug = clean_slug(name)
        if not slug:
            slug = f"player-{pid}"

        difficulty = 'Easy' if highest_mv >= 40000000 else ('Medium' if highest_mv >= 15000000 else 'Hard')

        players.append({
            'id': slug,
            'fullName': name,
            'displayName': name,
            'alternativeNames': [name],
            'nationality': country,
            'countryCode': code,
            'flagEmoji': flag,
            'league': league,
            'position': position,
            'positionAbbr': position_abbr,
            'currentClub': current_club,
            'clubAbbr': make_abbr(current_club),
            'age': age,
            'isRetired': False,
            'previousClubs': previous_clubs,
            'achievements': [],
            'imageUrl': image_url,
            'difficulty': difficulty,
            'isActive': True,
            'highestMarketValue': highest_mv,
            'currentMarketValue': current_mv,
        })

# Sort by notoriety (highest market value first)
players.sort(key=lambda p: (p['currentMarketValue'], p['highestMarketValue']), reverse=True)

# Deduplicate by slug
seen = set()
unique_players = []
for p in players:
    if p['id'] not in seen:
        seen.add(p['id'])
        del p['highestMarketValue']
        del p['currentMarketValue']
        unique_players.append(p)

# Take top 1,500 most famous active modern players
top_players = unique_players[:1500]

print(f"Total processed: {len(top_players)} footballers.")
with open('src/data/footballers.json', 'w', encoding='utf-8') as f:
    json.dump(top_players, f, indent=2, ensure_ascii=False)

print("Saved to src/data/footballers.json successfully!")
