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
    'COL1': 'Liga Colombiana',
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
    'Uzbekistan': ('UZ', 'UZ'),
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
    'Curacao': ('CW', '🇨🇼'),
    'New Caledonia': ('NC', '🇳🇨'),
    'Tanzania': ('TZ', '🇹🇿'),
    'Jordan': ('JO', '🇯🇴'),
    'Bangladesh': ('BD', '🇧🇩'),
    'Comoros': ('KM', '🇰🇲'),
    'China': ('CN', '🇨🇳'),
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
    'fc bayern munich': 'Bayern Munich',
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
    'associazione sportiva roma': 'Roma',
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
    'bayer 04 leverkusen': 'Bayer Leverkusen',
    'bayer leverkusen': 'Bayer Leverkusen',
    'leverkusen': 'Bayer Leverkusen',
    'brighton & hove albion': 'Brighton',
    'brighton': 'Brighton',
    'fenerbahce': 'Fenerbahçe',
    'fenerbahce sk': 'Fenerbahçe',
    'fenerbahçe': 'Fenerbahçe',
    'fenerbahçe sk': 'Fenerbahçe',
    'galatasaray a.s.': 'Galatasaray',
    'galatasaray': 'Galatasaray',
    'besiktas jk': 'Beşiktaş',
    'besiktas': 'Beşiktaş',
    'beşiktaş': 'Beşiktaş',
    'montpellier hsc': 'Montpellier',
    'montpellier': 'Montpellier',
    'paris fc': 'Paris FC',
    'swansea city': 'Swansea City',
    'swansea': 'Swansea City',
    'west bromwich albion': 'West Bromwich Albion',
    'west brom': 'West Bromwich Albion',
    'coventry city': 'Coventry City',
    'coventry': 'Coventry City',
    'leeds united': 'Leeds United',
    'leeds': 'Leeds United',
    'southampton fc': 'Southampton',
    'southampton': 'Southampton',
    'brentford fc': 'Brentford',
    'brentford': 'Brentford',
    'crystal palace': 'Crystal Palace',
    'fulham fc': 'Fulham',
    'fulham': 'Fulham',
    'wolverhampton wanderers': 'Wolves',
    'wolves': 'Wolves',
    'as monaco': 'Monaco',
    'monaco': 'Monaco',
    'lille osc': 'Lille',
    'lille': 'Lille',
    'olympique lyon': 'Lyon',
    'lyon': 'Lyon',
    'olympique marseille': 'Marseille',
    'marseille': 'Marseille',
    'ogc nice': 'Nice',
    'nice': 'Nice',
    'stade rennais fc': 'Rennes',
    'stade rennais': 'Rennes',
    'rennes': 'Rennes',
    'rc lens': 'Lens',
    'lens': 'Lens',
    'eintracht frankfurt': 'Frankfurt',
    'frankfurt': 'Frankfurt',
    'vfb stuttgart': 'VfB Stuttgart',
    'stuttgart': 'VfB Stuttgart',
    'rb leipzig': 'RB Leipzig',
    'leipzig': 'RB Leipzig',
    'vfl wolfsburg': 'VfL Wolfsburg',
    'wolfsburg': 'VfL Wolfsburg',
    'borussia monchengladbach': 'Borussia Mönchengladbach',
    'mönchengladbach': 'Borussia Mönchengladbach',
    'monchengladbach': 'Borussia Mönchengladbach',
    'ss lazio': 'Lazio',
    'lazio': 'Lazio',
    'acf fiorentina': 'Fiorentina',
    'fiorentina': 'Fiorentina',
    'atalanta bc': 'Atalanta',
    'atalanta': 'Atalanta',
    'torino fc': 'Torino',
    'torino': 'Torino',
    'bologna fc 1909': 'Bologna',
    'bologna': 'Bologna',
    'athletic bilbao': 'Athletic Club',
    'athletic club': 'Athletic Club',
    'real sociedad': 'Real Sociedad',
    'real betis balompie': 'Real Betis',
    'real betis': 'Real Betis',
    'betis': 'Real Betis',
    'rcd espanyol barcelona': 'Espanyol',
    'rcd espanyol': 'Espanyol',
    'espanyol': 'Espanyol',
    'rc celta de vigo': 'Celta Vigo',
    'celta de vigo': 'Celta Vigo',
    'celta vigo': 'Celta Vigo',
    'ca osasuna': 'Osasuna',
    'osasuna': 'Osasuna',
    'getafe cf': 'Getafe',
    'getafe': 'Getafe',
    'rayo vallecano': 'Rayo Vallecano',
    'girona fc': 'Girona',
    'girona': 'Girona',
    'al-ahli sfc': 'Al-Ahli',
    'al-ahli': 'Al-Ahli',
    'al-ittihad club': 'Al-Ittihad',
    'al-ittihad': 'Al-Ittihad',
    'los angeles fc': 'Los Angeles FC',
    'lafc': 'Los Angeles FC',
    'la galaxy': 'LA Galaxy',
    'new york red bulls': 'New York Red Bulls',
    'new york city fc': 'New York City FC',
    'new york city': 'New York City FC',
    'philadelphia union': 'Philadelphia Union',
    'seattle sounders fc': 'Seattle Sounders',
    'seattle sounders': 'Seattle Sounders',
    'feyenoord rotterdam': 'Feyenoord',
    'feyenoord': 'Feyenoord',
    'psv eindhoven': 'PSV Eindhoven',
    'psv': 'PSV Eindhoven',
    'az alkmaar': 'AZ Alkmaar',
    'az': 'AZ Alkmaar',
    'sc braga': 'Braga',
    'braga': 'Braga',
    'fc copenhagen': 'Copenhagen',
    'copenhagen': 'Copenhagen',
    'crvena zvezda': 'Red Star Belgrade',
    'red star belgrade': 'Red Star Belgrade',
    'red star': 'Red Star Belgrade',
    'gnk dinamo zagreb': 'Dinamo Zagreb',
    'dinamo zagreb': 'Dinamo Zagreb',
    'fc shakhtar donetsk': 'Shakhtar Donetsk',
    'shakhtar donetsk': 'Shakhtar Donetsk',
    'dynamo kyiv': 'Dynamo Kyiv',
    'fc dynamo kyiv': 'Dynamo Kyiv',
    'olympiacos piraeus': 'Olympiacos',
    'olympiacos fc': 'Olympiacos',
    'olympiacos': 'Olympiacos',
    'paok thessaloniki': 'PAOK',
    'paok': 'PAOK',
    'panathinaikos fc': 'Panathinaikos',
    'panathinaikos': 'Panathinaikos',
    'aek athens': 'AEK Athens',
    'fc spartak moscow': 'Spartak Moscow',
    'spartak moscow': 'Spartak Moscow',
    'zenit st. petersburg': 'Zenit',
    'zenit': 'Zenit',
    'pfc cska moscow': 'CSKA Moscow',
    'cska moscow': 'CSKA Moscow',
    'flamengo': 'Flamengo',
    'clube de regatas do flamengo': 'Flamengo',
    'palmeiras': 'Palmeiras',
    'sociedade esportiva palmeiras': 'Palmeiras',
    'santos fc': 'Santos',
    'santos': 'Santos',
    'sao paulo fc': 'São Paulo',
    'são paulo': 'São Paulo',
    'corinthians': 'Corinthians',
    'sport club corinthians paulista': 'Corinthians',
    'gremio': 'Grêmio',
    'grêmio': 'Grêmio',
    'internacional': 'Internacional',
    'sport club internacional': 'Internacional',
    'fluminense': 'Fluminense',
    'fluminense football club': 'Fluminense',
    'atletico mineiro': 'Atlético Mineiro',
    'clube atletico mineiro': 'Atlético Mineiro',
    'boca juniors': 'Boca Juniors',
    'club atletico boca juniors': 'Boca Juniors',
    'river plate': 'River Plate',
    'club atletico river plate': 'River Plate',
    'racing club': 'Racing Club',
    'independiente': 'Independiente',
    'san lorenzo': 'San Lorenzo',
    'club america': 'Club América',
    'america': 'Club América',
    'cd guadalajara': 'Chivas',
    'chivas': 'Chivas',
    'cf monterrey': 'Monterrey',
    'monterrey': 'Monterrey',
    'tigres uanl': 'Tigres',
    'tigres': 'Tigres',
    'cruz azul': 'Cruz Azul',
    'pumas unam': 'Pumas',
    'millonarios fc': 'Millonarios',
    'millonarios': 'Millonarios',
    'junior fc': 'Junior',
    'junior': 'Junior',
    'atletico nacional': 'Atlético Nacional',
    'atlético nacional': 'Atlético Nacional',
    'cd america de cali': 'América de Cali',
    'américa de cali': 'América de Cali',
    'atletico bucaramanga': 'Atlético Bucaramanga',
    'atlético bucaramanga': 'Atlético Bucaramanga',
}

# Regex to detect youth/reserve teams
YOUTH_RE = re.compile(
    r'(\bU\s*\d{2}\b|\bSub[- ]\d{2}\b|\bYth\.?\b|\bYouth\b|\bRes\.?\b|\bReserve[s]?\b|\bAcad\.?\b|\bAcademy\b|\bJug\.?\b|\bJugend\b|\bFor\.?\b|\bForm\.?\b|\bFormation\b|\bJuvenil\b|\bJV\b|\bJun\.?\b|\bJuniors?\b|\bPrimavera\b|\bII\b|\bIII\b|\b B\b|\b C\b)',
    re.IGNORECASE
)

DATE_SUFFIX_RE = re.compile(r'\s*\(-?\s*\d{4}\)', re.IGNORECASE)

KNOWN_EXPANSIONS = {
    'shakhtar d.': 'Shakhtar Donetsk',
    'sparta r.': 'Sparta Rotterdam',
    'toulouse for.': 'Toulouse',
    'argentinos jrs.': 'Argentinos Juniors',
    'argentinos jrs': 'Argentinos Juniors',
    'kawasaki front.': 'Kawasaki Frontale',
    'heart of midl.': 'Heart of Midlothian',
    'newell\'s jv': 'Newell\'s Old Boys',
    'newell\'s': 'Newell\'s Old Boys',
    'newells': 'Newell\'s Old Boys',
}

# Common nicknames
NICKNAMES = {
    'cristiano-ronaldo': ['CR7', 'El Bicho', 'Ronaldo'],
    'lionel-messi': ['Leo Messi', 'La Pulga', 'Messi'],
    'sergio-aguero': ['Kun Agüero', 'Kun Aguero', 'Kun'],
    'fernando-torres': ['El Niño', 'El Nino'],
    'ronaldo-nazario': ['O Fenômeno', 'O Fenomeno', 'R9', 'El Fenómeno'],
    'kevin-de-bruyne': ['KDB'],
    'vinicius-junior': ['Vini Jr', 'Vini Jr.', 'Vini'],
    'erling-haaland': ['Haaland'],
    'kylian-mbappe': ['Mbappé', 'Mbappe'],
    'neymar': ['Neymar Jr', 'Neymar Jr.'],
    'son-heung-min': ['Sonny', 'Son'],
    'luka-modric': ['Lukita'],
    'karim-benzema': ['Benzema', 'KB9'],
    'robert-lewandowski': ['Lewy', 'Lewandowski'],
    'javier-hernandez': ['Chicharito'],
    'alexis-sanchez': ['El Niño Maravilla', 'Alexis'],
}

# Manual backfill of complete senior career history for legacy / veteran players
LEGACY_CAREERS = {
    'gerard-pique': ['Manchester United', 'Real Zaragoza', 'Barcelona'],
    'marco-verratti': ['Pescara', 'Paris Saint-Germain', 'Al-Arabi'],
    'lorenzo-insigne': ['Napoli', 'Cavese', 'Foggia', 'Pescara', 'Toronto FC'],
    'giorgio-chiellini': ['Livorno', 'Fiorentina', 'Juventus', 'Los Angeles FC'],
    'daniele-de-rossi': ['Roma', 'Boca Juniors'],
    'antonio-valencia': ['El Nacional', 'Villarreal', 'Recreativo', 'Wigan Athletic', 'Manchester United', 'LDU Quito', 'Querétaro'],
    'samir-handanovic': ['Domžale', 'Zagorje', 'Udinese', 'Treviso', 'Lazio', 'Rimini', 'Inter Milan'],
    'patson-daka': ['Kafue Celtic', 'Power Dynamos', 'Liefering', 'Red Bull Salzburg', 'Leicester City'],
    'lars-bender': ['1860 Munich', 'Bayer Leverkusen'],
    'marcel-halstenberg': ['Hannover 96', 'Borussia Dortmund', 'FC St. Pauli', 'RB Leipzig', 'Hannover 96'],
    'leighton-baines': ['Wigan Athletic', 'Everton'],
    'enock-mwepu': ['Kafue Celtic', 'NAPSA Stars', 'Liefering', 'Red Bull Salzburg', 'Brighton'],
    'mario-gaspar': ['Villarreal', 'Watford', 'Elche'],
    'phil-jones': ['Blackburn Rovers', 'Manchester United'],
    'riccardo-montolivo': ['Atalanta', 'Fiorentina', 'AC Milan'],
    'juanfran-torres': ['Real Madrid', 'Espanyol', 'Osasuna', 'Atlético Madrid', 'São Paulo'],
    'lukasz-piszczek': ['Zagłębie Lubin', 'Hertha BSC', 'Borussia Dortmund', 'Goczałkowice-Zdrój'],
    'vedran-corluka': ['Dinamo Zagreb', 'Inter Zaprešić', 'Manchester City', 'Tottenham Hotspur', 'Bayer Leverkusen', 'Lokomotiv Moscow'],
    'andrea-barzagli': ['Rondinella', 'Pistoiese', 'Ascoli', 'Chievo', 'Palermo', 'VfL Wolfsburg', 'Juventus'],
    'senad-lulic': ['Chur 97', 'Bellinzona', 'Grasshopper', 'Young Boys', 'Lazio'],
    'ignazio-abate': ['Napoli', 'Piacenza', 'Modena', 'Empoli', 'Torino', 'AC Milan'],
    'selcuk-inan': ['Dardanelspor', 'Manisaspor', 'Trabzonspor', 'Galatasaray'],
    'onur-kivrak': ['Karşıyaka', 'Trabzonspor'],
    'mikel-san-jose': ['Liverpool', 'Athletic Club', 'Birmingham City', 'Amorebieta'],
    'asamoah-gyan': ['Liberty Professionals', 'Udinese', 'Modena', 'Rennes', 'Sunderland', 'Al Ain', 'Shanghai SIPG', 'Kayserispor', 'NorthEast United', 'Legon Cities'],
    'troy-deeney': ['Chelmsley Town', 'Walsall', 'Halesowen Town', 'Watford', 'Birmingham City', 'Forest Green Rovers'],
    'fredy-montero': ['Deportivo Cali', 'Academia', 'Atlético Huila', 'Seattle Sounders', 'Millonarios', 'Sporting CP', 'Tianjin TEDA', 'Vancouver Whitecaps'],
    'stephane-ruffier': ['Monaco', 'Bayonne', 'Saint-Étienne'],
    'lei-wu': ['Shanghai Port', 'Espanyol', 'Shanghai Port'],
    'santiago-caseres': ['Vélez Sarsfield', 'Villarreal', 'Club América', 'Vélez Sarsfield'],
    'mikel-oyarzabal': ['Eibar', 'Real Sociedad'],
}

# Mononym disambiguation overrides
MONONYM_OVERRIDES = {
    'gabriel': {
        'displayName': 'Gabriel Magalhães',
        'fullName': 'Gabriel dos Santos Magalhães',
        'alternativeNames': ['Gabriel', 'Gabriel Magalhaes', 'Gabriel Magalhães'],
    },
    'wesley': {
        'displayName': 'Wesley Gassova',
        'fullName': 'Wesley Vinícius dos Santos Gassova',
        'alternativeNames': ['Wesley', 'Wesley Gassova'],
    },
    'kevin': {
        'displayName': 'Kevin',
        'fullName': 'Kevin Santos Lopes de Macedo',
        'alternativeNames': ['Kevin', 'Kevin Santos'],
    },
    'rayan': {
        'displayName': 'Rayan',
        'fullName': 'Rayan Vitor Simplício Rocha',
        'alternativeNames': ['Rayan', 'Rayan Vitor'],
    },
    'jordan': {
        'displayName': 'Jordan Siebatcheu',
        'fullName': 'Jordan Siebatcheu',
        'alternativeNames': ['Jordan Pefok', 'Jordan', 'Siebatcheu', 'Pefok'],
    },
}

# Deceased icons IDs
DECEASED_ICONS = {
    'diego-maradona',
    'pele',
    'johan-cruyff',
    'franz-beckenbauer',
    'lev-yashin',
    'ferenc-puskas',
    'gerd-muller',
}

# Deceased modern players to exclude from dataset
DECEASED_PLAYERS = {
    'emiliano-sala',
    'christian-atsu',
}

def clean_slug(name: str) -> str:
    replacements = {
        'ø': 'o', 'Ø': 'o',
        'ı': 'i', 'İ': 'i',
        'ł': 'l', 'Ł': 'l',
        'æ': 'ae', 'Æ': 'ae',
        'œ': 'oe', 'Œ': 'oe',
        'ß': 'ss',
        'ð': 'd', 'Ð': 'd',
        'þ': 'th', 'Þ': 'th',
    }
    for char, rep in replacements.items():
        name = name.replace(char, rep)
    
    nfd = unicodedata.normalize('NFD', name)
    clean = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', clean).strip('-').lower()
    return re.sub(r'-+', '-', slug)

def clean_club_name(name: str) -> str:
    if not name or 'without club' in name.lower() or 'unknown' in name.lower():
        return ''
    
    # Strip dissolution date suffix like "(-2020)"
    name = DATE_SUFFIX_RE.sub('', name).strip()
    
    low = name.lower()
    if low in KNOWN_EXPANSIONS:
        name = KNOWN_EXPANSIONS[low]
        low = name.lower()
    
    # Guard Paris FC before stripping FC!
    if low == 'paris fc':
        return 'Paris FC'
    
    # Check if youth / reserve / amateur formation
    if YOUTH_RE.search(name):
        return ''
    
    # Standardize general corporate and legal entity abbreviations
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
# Map: pid -> list of (transfer_date, from_club, to_club)
player_transfers = {}
with open('data/transfermarkt/transfers.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        pid = row['player_id']
        t_date = row.get('transfer_date') or '1970-01-01'
        fc = clean_club_name(row.get('from_club_name', ''))
        tc = clean_club_name(row.get('to_club_name', ''))
        if pid not in player_transfers:
            player_transfers[pid] = []
        player_transfers[pid].append((t_date, fc, tc))

print("3. Augmenting match appearances chronologically from appearances.csv...")
player_appearances = {}
with open('data/transfermarkt/appearances.csv', mode='r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        pid = row['player_id']
        app_date = row.get('date') or '1970-01-01'
        cid = row.get('player_club_id')
        if cid and cid in club_id_to_name:
            cname = club_id_to_name[cid]
            if cname:
                if pid not in player_appearances:
                    player_appearances[pid] = []
                player_appearances[pid].append((app_date, cname))

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
        birth_year = 2001
        if dob_str:
            try:
                dob_clean = dob_str.split()[0]
                dt = datetime.strptime(dob_clean, '%Y-%m-%d')
                age = now.year - dt.year - ((now.month, now.day) < (dt.month, dt.day))
                birth_year = dt.year
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

        # Check if manual legacy career backfill exists
        pid = row['player_id']
        if slug in LEGACY_CAREERS:
            raw_career = LEGACY_CAREERS[slug]
            # In Approach B, if player is retired, last club in career is currentClub
            is_ret = (last_season <= 2023 and age >= 36)
            if is_ret and len(raw_career) > 1:
                current_club = raw_career[-1]
                previous_clubs = raw_career[:-1]
            else:
                current_club_norm = current_club.lower()
                previous_clubs = [c for c in raw_career if c.lower() != current_club_norm]
        else:
            # Reconstruct career sequentially from sorted transfers
            t_events = sorted(player_transfers.get(pid, []), key=lambda x: x[0])
            
            career_sequence = []
            for t_date, fc, tc in t_events:
                if fc:
                    if not career_sequence or career_sequence[-1] != fc:
                        career_sequence.append(fc)
                if tc:
                    if not career_sequence or career_sequence[-1] != tc:
                        career_sequence.append(tc)
            
            # Augment with appearance clubs if transfers were sparse
            app_events = sorted(player_appearances.get(pid, []), key=lambda x: x[0])
            for a_date, cname in app_events:
                if cname:
                    if not career_sequence:
                        career_sequence.append(cname)
                    elif cname not in career_sequence:
                        career_sequence.append(cname)

            is_ret = (last_season <= 2023 and age >= 36)
            if is_ret and career_sequence:
                # Approach B: last club is currentClub
                current_club = career_sequence[-1]
                # Exclude occurrences of currentClub from previousClubs
                norm_last = current_club.lower()
                previous_clubs = [c for c in career_sequence[:-1] if c.lower() != norm_last]
            else:
                # Active player: remove trailing occurrences of current club
                norm_curr = current_club.lower()
                while career_sequence and career_sequence[-1].lower() == norm_curr:
                    career_sequence.pop()
                previous_clubs = [c for c in career_sequence if c.lower() != norm_curr]

            # Sequential clean: collapse adjacent duplicates while preserving multiple distinct spells
            collapsed_prev = []
            for c in previous_clubs:
                if not collapsed_prev or collapsed_prev[-1] != c:
                    collapsed_prev.append(c)
            previous_clubs = collapsed_prev

        # Disambiguate mononyms
        disp_name = name
        full_name = name
        alt_names = [name]
        
        if slug in MONONYM_OVERRIDES:
            ov = MONONYM_OVERRIDES[slug]
            disp_name = ov['displayName']
            full_name = ov['fullName']
            alt_names = list(ov['alternativeNames'])
        
        # Ensure display name is always in alternative names
        if disp_name not in alt_names:
            alt_names.insert(0, disp_name)

        if slug in NICKNAMES:
            for nick in NICKNAMES[slug]:
                if nick not in alt_names:
                    alt_names.append(nick)

        difficulty = 'Easy' if highest_mv >= 40000000 else ('Medium' if highest_mv >= 15000000 else 'Hard')
        image_url = row.get('image_url') or ''

        players.append({
            'id': slug,
            'fullName': full_name,
            'displayName': disp_name,
            'alternativeNames': alt_names,
            'nationality': country,
            'countryCode': code,
            'flagEmoji': flag,
            'league': league,
            'position': position,
            'positionAbbr': position_abbr,
            'currentClub': current_club,
            'age': age,
            'birthYear': birth_year,
            'isRetired': is_ret,
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

# Approach B mappings for all 62 curated legends: (final senior club, league of final club)
APPROACH_B_LEGENDS = {
    'diego-maradona': ('Newell\'s Old Boys', 'Argentine Primera'),
    'pele': ('New York Cosmos', 'Other League'),
    'zinedine-zidane': ('Real Madrid', 'La Liga'),
    'ronaldo-nazario': ('Corinthians', 'Brasileirão'),
    'ronaldinho': ('Querétaro', 'Liga MX'),
    'thierry-henry': ('New York Red Bulls', 'MLS'),
    'paolo-maldini': ('AC Milan', 'Serie A'),
    'roberto-carlos': ('Anzhi Makhachkala', 'Russian Premier League'),
    'cafu': ('AC Milan', 'Serie A'),
    'kaka': ('Orlando City', 'MLS'),
    'andres-iniesta': ('Emirates Club', 'Other League'),
    'xavi': ('Al Sadd', 'Other League'),
    'andrea-pirlo': ('New York City FC', 'MLS'),
    'david-beckham': ('Paris Saint-Germain', 'Ligue 1'),
    'steven-gerrard': ('LA Galaxy', 'MLS'),
    'frank-lampard': ('New York City FC', 'MLS'),
    'paul-scholes': ('Manchester United', 'Premier League'),
    'patrick-vieira': ('Manchester City', 'Premier League'),
    'dennis-bergkamp': ('Arsenal', 'Premier League'),
    'alan-shearer': ('Newcastle United', 'Premier League'),
    'wayne-rooney': ('Derby County', 'Other League'),
    'didier-drogba': ('Phoenix Rising', 'Other League'),
    'samuel-etoo': ('Qatar SC', 'Other League'),
    'iker-casillas': ('Porto', 'Primeira Liga'),
    'gianluigi-buffon': ('Parma', 'Serie A'),
    'peter-schmeichel': ('Manchester City', 'Premier League'),
    'oliver-kahn': ('Bayern Munich', 'Bundesliga'),
    'carles-puyol': ('Barcelona', 'La Liga'),
    'alessandro-nesta': ('Chennaiyin', 'Other League'),
    'fabio-cannavaro': ('Al-Ahli', 'Other League'),
    'rio-ferdinand': ('Queens Park Rangers', 'Other League'),
    'sergio-aguero': ('Barcelona', 'La Liga'),
    'raul': ('New York Cosmos', 'Other League'),
    'luis-figo': ('Inter Milan', 'Serie A'),
    'rivaldo': ('Mogi Mirim', 'Brasileirão'),
    'zlatan-ibrahimovic': ('AC Milan', 'Serie A'),
    'gareth-bale': ('Los Angeles FC', 'MLS'),
    'ruud-van-nistelrooy': ('Málaga', 'La Liga'),
    'andriy-shevchenko': ('Dynamo Kyiv', 'Ukrainian Premier League'),
    'clarence-seedorf': ('Botafogo', 'Brasileirão'),
    'ruud-gullit': ('Chelsea', 'Premier League'),
    'marco-van-basten': ('AC Milan', 'Serie A'),
    'lothar-matthaus': ('MetroStars', 'MLS'),
    'romario': ('América-RJ', 'Brasileirão'),
    'gabriel-batistuta': ('Al-Arabi', 'Other League'),
    'javier-zanetti': ('Inter Milan', 'Serie A'),
    'hristo-stoichkov': ('D.C. United', 'MLS'),
    'george-weah': ('Al-Jazira', 'Other League'),
    'franco-baresi': ('AC Milan', 'Serie A'),
    'johan-cruyff': ('Feyenoord', 'Eredivisie'),
    'franz-beckenbauer': ('New York Cosmos', 'Other League'),
    'michel-platini': ('Juventus', 'Serie A'),
    'lev-yashin': ('Dynamo Moscow', 'Russian Premier League'),
    'ferenc-puskas': ('Real Madrid', 'La Liga'),
    'gerd-muller': ('Fort Lauderdale Strikers', 'Other League'),
    'ronald-koeman': ('Feyenoord', 'Eredivisie'),
    'eric-cantona': ('Manchester United', 'Premier League'),
    'michael-owen': ('Stoke City', 'Premier League'),
    'fernando-torres': ('Sagan Tosu', 'J1 League'),
    'mesut-ozil': ('İstanbul Başakşehir', 'Süper Lig'),
    'eden-hazard': ('Real Madrid', 'La Liga'),
    'diego-godin': ('Vélez Sarsfield', 'Argentine Primera'),
}

# Canonical exact ages and birth years for curated legends as of Nov 2026
LEGEND_METADATA = {
    'diego-maradona': (60, 1960),
    'pele': (82, 1940),
    'johan-cruyff': (68, 1947),
    'franz-beckenbauer': (78, 1945),
    'lev-yashin': (60, 1929),
    'ferenc-puskas': (79, 1927),
    'gerd-muller': (75, 1945),
    'diego-godin': (40, 1986),
    'zinedine-zidane': (54, 1972),
    'ronaldo-nazario': (50, 1976),
    'ronaldinho': (46, 1980),
    'thierry-henry': (49, 1977),
    'paolo-maldini': (58, 1968),
    'roberto-carlos': (53, 1973),
    'cafu': (56, 1970),
    'kaka': (44, 1982),
    'andres-iniesta': (42, 1984),
    'xavi': (46, 1980),
    'andrea-pirlo': (47, 1979),
    'david-beckham': (51, 1975),
    'steven-gerrard': (46, 1980),
    'frank-lampard': (48, 1978),
    'paul-scholes': (51, 1974),
    'patrick-vieira': (50, 1976),
    'dennis-bergkamp': (57, 1969),
    'alan-shearer': (56, 1970),
    'wayne-rooney': (41, 1985),
    'didier-drogba': (48, 1978),
    'samuel-etoo': (45, 1981),
    'iker-casillas': (45, 1981),
    'gianluigi-buffon': (48, 1978),
    'peter-schmeichel': (62, 1963),
    'oliver-kahn': (57, 1969),
    'carles-puyol': (48, 1978),
    'alessandro-nesta': (50, 1976),
    'fabio-cannavaro': (53, 1973),
    'rio-ferdinand': (48, 1978),
    'sergio-aguero': (38, 1988),
    'raul': (49, 1977),
    'luis-figo': (54, 1972),
    'rivaldo': (54, 1972),
    'zlatan-ibrahimovic': (45, 1981),
    'gareth-bale': (37, 1989),
    'ruud-van-nistelrooy': (50, 1976),
    'andriy-shevchenko': (50, 1976),
    'clarence-seedorf': (50, 1976),
    'ruud-gullit': (64, 1962),
    'marco-van-basten': (62, 1964),
    'lothar-matthaus': (65, 1961),
    'romario': (60, 1966),
    'gabriel-batistuta': (57, 1969),
    'javier-zanetti': (53, 1973),
    'hristo-stoichkov': (60, 1966),
    'george-weah': (60, 1966),
    'franco-baresi': (66, 1960),
    'michel-platini': (71, 1955),
    'ronald-koeman': (63, 1963),
    'eric-cantona': (60, 1966),
    'michael-owen': (46, 1979),
    'fernando-torres': (42, 1984),
    'mesut-ozil': (38, 1988),
    'eden-hazard': (35, 1991),
}

seen = set()
final_players = []

# 1. Legends first
for legend in LEGENDS:
    if legend['id'] not in seen:
        seen.add(legend['id'])
        clean_leg = dict(legend)
        clean_leg.pop('achievements', None)
        clean_leg.pop('clubAbbr', None)
        
        # Apply Approach B (literal final senior club)
        lid = clean_leg['id']
        if lid in APPROACH_B_LEGENDS:
            last_club, last_league = APPROACH_B_LEGENDS[lid]
            clean_leg['currentClub'] = last_club
            clean_leg['league'] = last_league
            
            # Reconstruct previousClubs excluding currentClub
            orig_prev = list(clean_leg.get('previousClubs', []))
            clean_prev = []
            for c in orig_prev:
                c_clean = clean_club_name(c)
                if c_clean and c_clean.lower() != last_club.lower():
                    if not clean_prev or clean_prev[-1] != c_clean:
                        clean_prev.append(c_clean)
            clean_leg['previousClubs'] = clean_prev
            
        if lid in LEGEND_METADATA:
            clean_leg['age'] = LEGEND_METADATA[lid][0]
            clean_leg['birthYear'] = LEGEND_METADATA[lid][1]
            
        # Deceased icons carry isActive: false
        if lid in DECEASED_ICONS:
            clean_leg['isActive'] = False
        else:
            clean_leg['isActive'] = True
            
        # Ensure displayName is always in alternativeNames
        disp = clean_leg['displayName']
        alts = list(clean_leg.get('alternativeNames', []))
        if disp not in alts:
            alts.insert(0, disp)
        clean_leg['alternativeNames'] = alts
        
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
