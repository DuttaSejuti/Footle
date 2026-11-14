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
    'jorrit-hendrix': 'Netherlands',
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

# Canonical display names keyed by a lenient club key. This is what removes
# alias duplicates such as "Basel" / "FC Basel 1893" from career lists.
CLUB_ALIASES = {
    'redbullsalzburg': 'RB Salzburg',
    'fussballclubredbullsalzburg': 'RB Salzburg',
    'salzburg': 'RB Salzburg',
    'psg': 'Paris Saint-Germain',
    'parissaintgermain': 'Paris Saint-Germain',
    'bayernmunich': 'Bayern Munich',
    'bayernmunchen': 'Bayern Munich',
    'bayern': 'Bayern Munich',
    'intermilan': 'Inter Milan',
    'internazionale': 'Inter Milan',
    'internazionalemilano': 'Inter Milan',
    'inter': 'Inter Milan',
    'milan': 'AC Milan',
    'acmilan': 'AC Milan',
    'atleticomadrid': 'Atlético Madrid',
    'atletico': 'Atlético Madrid',
    'manchesterunited': 'Manchester United',
    'manutd': 'Manchester United',
    'manchestercity': 'Manchester City',
    'mancity': 'Manchester City',
    'tottenhamhotspur': 'Tottenham Hotspur',
    'tottenham': 'Tottenham Hotspur',
    'spurs': 'Tottenham Hotspur',
    'borussiadortmund': 'Borussia Dortmund',
    'dortmund': 'Borussia Dortmund',
    'bvb': 'Borussia Dortmund',
    'bayerleverkusen': 'Bayer Leverkusen',
    'bayer04leverkusen': 'Bayer Leverkusen',
    'bleverkusen': 'Bayer Leverkusen',
    'leverkusen': 'Bayer Leverkusen',
    'borussiamonchengladbach': 'Borussia Mönchengladbach',
    'monchengladbach': 'Borussia Mönchengladbach',
    'gladbach': 'Borussia Mönchengladbach',
    'wolverhamptonwanderers': 'Wolves',
    'wolverhampton': 'Wolves',
    'wolves': 'Wolves',
    'brightonandhovealbion': 'Brighton',
    'brighton': 'Brighton',
    'westhamunited': 'West Ham',
    'westham': 'West Ham',
    'newcastleunited': 'Newcastle United',
    'newcastle': 'Newcastle United',
    'leicestercity': 'Leicester City',
    'leicester': 'Leicester City',
    'leedsunited': 'Leeds United',
    'leeds': 'Leeds United',
    'swanseacity': 'Swansea City',
    'swansea': 'Swansea City',
    'coventrycity': 'Coventry City',
    'coventry': 'Coventry City',
    'sportingcp': 'Sporting CP',
    'sportinglisbon': 'Sporting CP',
    'sporting': 'Sporting CP',
    'riverplate': 'River Plate',
    'clubatleticoriverplate': 'River Plate',
    'bocajuniors': 'Boca Juniors',
    'clubatleticobocajuniors': 'Boca Juniors',
    'internacional': 'Internacional',
    'sportclubinternacional': 'Internacional',
    'saopaulo': 'São Paulo',
    'corinthians': 'Corinthians',
    'sportclubcorinthianspaulista': 'Corinthians',
    'gremio': 'Grêmio',
    'atleticomineiro': 'Atlético Mineiro',
    'clubatleticomineiro': 'Atlético Mineiro',
    'fluminense': 'Fluminense',
    'fluminensefootballclub': 'Fluminense',
    'queretaro': 'Querétaro',
    'newellsoldboys': "Newell's Old Boys",
    'newells': "Newell's Old Boys",
    'newell': "Newell's Old Boys",
    'zenit': 'Zenit',
    'zenitspb': 'Zenit',
    'zenitsanktpetersburg': 'Zenit',
    'aofkzenitsanktpetersburg': 'Zenit',
    'aofkzenitsanktpeterburg': 'Zenit',
    'pfkcska': 'CSKA Moscow',
    'pfkcskamoskva': 'CSKA Moscow',
    'cskamoscow': 'CSKA Moscow',
    'cska': 'CSKA Moscow',
    'basaksehir': 'İstanbul Başakşehir',
    'istanbulbasaksehir': 'İstanbul Başakşehir',
    'orlando': 'Orlando City',
    'orlandocity': 'Orlando City',
    'brugge': 'Club Brugge',
    'bruggekv': 'Club Brugge',
    'clubbrugge': 'Club Brugge',
    'fkzenitsanktpeterburg': 'Zenit',
    'fkzenitsanktpetersburg': 'Zenit',
    'besiktasjimnastikkulubu': 'Beşiktaş',
    'deportivoalaves': 'Alavés',
    'alaves': 'Alavés',
    'vitoriaguimaraes': 'Vitória Guimarães',
    'vitguimaraes': 'Vitória Guimarães',
    'guimaraes': 'Vitória Guimarães',
    'assaintetienne': 'Saint-Étienne',
    'saintetienne': 'Saint-Étienne',
    'udalmeria': 'Almería',
    'almeria': 'Almería',
    'cdleganes': 'Leganés',
    'leganes': 'Leganés',
    'atleticomg': 'Atlético Mineiro',
    'atleticopr': 'Athletico Paranaense',
    'fdusseldorf': 'Fortuna Düsseldorf',
    'fortunadusseldorf': 'Fortuna Düsseldorf',
    'dusseldorf': 'Fortuna Düsseldorf',
    'brondbyif': 'Brøndby',
    'brondby': 'Brøndby',
    'vitoriasetubal': 'Vitória Setúbal',
    'setubal': 'Vitória Setúbal',
    'csmartimo': 'Marítimo',
    'maritimo': 'Marítimo',
    'deplacoruna': 'Deportivo La Coruña',
    'deportivodelacoruna': 'Deportivo La Coruña',
    'deportivolacoruna': 'Deportivo La Coruña',
    'lacoruna': 'Deportivo La Coruña',
    'bodoglimt': 'Bodø/Glimt',
    'fotballklubbenbodoglimt': 'Bodø/Glimt',
    'sonderjyske': 'Sønderjyske',
    'sonderjyskefodbold': 'Sønderjyske',
    'karagumruk': 'Fatih Karagümrük',
    'fatihkaragumruk': 'Fatih Karagümrük',
    'mkeankaragucu': 'Ankaragücü',
    'ankaragucu': 'Ankaragücü',
    'lbchateauroux': 'Châteauroux',
    'chateauroux': 'Châteauroux',
    'nimesolympique': 'Nîmes',
    'nimes': 'Nîmes',
    'clubamerica': 'Club América',
    'america': 'Club América',
    'qatar': 'Qatar SC',
    'qatarsc': 'Qatar SC',
    'columbus': 'Columbus Crew',
    'columbuscrew': 'Columbus Crew',
    'houston': 'Houston Dynamo',
    'houstondynamo': 'Houston Dynamo',
    'ipswich': 'Ipswich Town',
    'ipswichtown': 'Ipswich Town',
    'mainz': 'Mainz 05',
    'mainz05': 'Mainz 05',
    'nottmforest': 'Nottingham Forest',
    'nottinghamforest': 'Nottingham Forest',
    'allmannaidrottsklubben': 'AIK',
    'norwich': 'Norwich City',
    'norwichcity': 'Norwich City',
    'vitesse': 'Vitesse',
    'vitessearnhem': 'Vitesse',
    'losc': 'Lille',
    'losclille': 'Lille',
    'lille': 'Lille',
    'krcgenk': 'Genk',
    'genk': 'Genk',
    'lokolmoscow': 'Lokomotiv Moscow',
    'lokomotivmoscow': 'Lokomotiv Moscow',
    'lokomotivmoskva': 'Lokomotiv Moscow',
    'parissg': 'Paris Saint-Germain',
    'koln': 'Köln',
    '1fckoln': 'Köln',
    'genoacfc': 'Genoa',
    'ussassuolo': 'Sassuolo',
    'ucsampdoria': 'Sampdoria',
    'uslecce': 'Lecce',
    'uscremonese': 'Cremonese',
    'ussalernitana': 'Salernitana',
    'gdestorilpraia': 'Estoril',
    'lutontown': 'Luton',
    'birminghamcity': 'Birmingham',
    'ajauxerre': 'Auxerre',
    'estactroyes': 'Troyes',
    'prestonnorthend': 'Preston',
    'paoksalonika': 'PAOK',
    'sinttruidensevv': 'Sint-Truiden',
    'panathinaikosathlitikosomilos': 'Panathinaikos',
    'stadebrestois29': 'Stade Brestois',
    'girondinsbordeaux': 'Bordeaux',
    'gbordeaux': 'Bordeaux',
    'safbotafogo': 'Botafogo',
    'blackburnrovers': 'Blackburn Rovers',
    'delfinopescara': 'Pescara',
    'twenteenschede': 'Twente',
    'efrankfurt': 'Eintracht Frankfurt',
    'wiganathletic': 'Wigan',
    'psveindhoven': 'PSV Eindhoven',
    'alsadd': 'Al Sadd',
    'dcunited': 'DC United',
    'interzapresic': 'Inter Zaprešić',
    'hercules': 'Hércules',
    'alain': 'Al Ain',
    'anzhimakhachkala': 'Anzhi Makhachkala',
    'anzhi': 'Anzhi Makhachkala',
    'shababalahli': 'Shabab Al-Ahli',
    'alahlidubai': 'Shabab Al-Ahli',
    'desnachernigiv': 'Desna',
    'desna': 'Desna',
    'clermontfoot63': 'Clermont Foot',
    'clermontfoot': 'Clermont Foot',
    'cardiff': 'Cardiff City',
    'cardiffcity': 'Cardiff City',
    'dijonfco': 'Dijon',
    'dijon': 'Dijon',
    'excelsiorrotterdam': 'Excelsior',
    'excelsior': 'Excelsior',
    'dniprodnipropetrovsk': 'Dnipro',
    'dnipro': 'Dnipro',
    'pisasporting': 'Pisa',
    'pisa': 'Pisa',
    'rodajckerkrade': 'Roda JC',
    'rodajc': 'Roda JC',
    'panserraikoserres': 'Panserraikos',
    'panserraikosserres': 'Panserraikos',
    'panserraikos': 'Panserraikos',
    'jagielloniabialystok': 'Jagiellonia',
    'jagiellonia': 'Jagiellonia',
    'genclerbirligispor': 'Gençlerbirliği',
    'genclerbirligisporkulubu': 'Gençlerbirliği',
    'genclerbirligi': 'Gençlerbirliği',
    'herculesalican': 'Hércules',
    'uralyekaterinburg': 'Ural',
    'ural': 'Ural',
    'chornomoretsodesa': 'Chornomorets',
    'chornomorets': 'Chornomorets',
    'ingolstadt04': 'Ingolstadt',
    'ingolstadt': 'Ingolstadt',
    'degraafschapdoetinchem': 'De Graafschap',
    'graafschapdoetinchem': 'De Graafschap',
    'degraafschap': 'De Graafschap',
    'eniseykrasnoyarsk': 'Enisey',
    'enisey': 'Enisey',
    'panioniosathens': 'Panionios',
    'panionios': 'Panionios',
    'malmofotbollforening': 'Malmö',
    'malmo': 'Malmö',
    'hammarbyif': 'Hammarby',
    'hammarby': 'Hammarby',
    'huddersfieldtown': 'Huddersfield Town',
    'huddersfield': 'Huddersfield Town',
    'seattlesounders': 'Seattle Sounders',
    'seattle': 'Seattle Sounders',
    'blythspartans': 'Blyth Spartans',
    'blyth': 'Blyth Spartans',
    'tokyo': 'FC Tokyo',
    'tokyoverdy': 'Tokyo Verdy',
}

# Name used for clubs that are placeholders rather than real teams.
INVALID_CLUBS = {
    'retired', 'career break', 'without club', 'without club', 'unknown',
    'free agent', 'none', 'n/a',
}

# Transliteration used to build ASCII search aliases.
ASCII_TRANSLIT = {
    'ø': 'o', 'Ø': 'O', 'ı': 'i', 'İ': 'I', 'ł': 'l', 'Ł': 'L',
    'æ': 'ae', 'Æ': 'AE', 'œ': 'oe', 'Œ': 'OE', 'ß': 'ss',
    'ð': 'd', 'Ð': 'D', 'þ': 'th', 'Þ': 'Th',
    'đ': 'd', 'Đ': 'D', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S',
    'ç': 'c', 'Ç': 'C', 'ñ': 'n', 'Ñ': 'N', 'å': 'a', 'Å': 'A',
    'ä': 'a', 'Ä': 'A', 'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U',
    'é': 'e', 'É': 'E', 'è': 'e', 'È': 'E', 'ê': 'e', 'Ê': 'E',
    'á': 'a', 'Á': 'A', 'à': 'a', 'À': 'A', 'â': 'a', 'Â': 'A',
    'ã': 'a', 'Ã': 'A', 'ó': 'o', 'Ó': 'O', 'ò': 'o', 'Ò': 'O',
    'ô': 'o', 'Ô': 'O', 'õ': 'o', 'Õ': 'O', 'í': 'i', 'Í': 'I',
    'ì': 'i', 'Ì': 'I', 'î': 'i', 'Î': 'I', 'ú': 'u', 'Ú': 'U',
    'ù': 'u', 'Ù': 'U', 'û': 'u', 'Û': 'U', 'ý': 'y', 'Ý': 'Y',
    'ÿ': 'y', 'Ÿ': 'Y', 'ř': 'r', 'Ř': 'R', 'č': 'c', 'Č': 'C',
    'š': 's', 'Š': 'S', 'ž': 'z', 'Ž': 'Z', 'ě': 'e', 'Ě': 'E',
    'ů': 'u', 'Ů': 'U', 'ń': 'n', 'Ń': 'N', 'ź': 'z', 'Ź': 'Z',
    'ż': 'z', 'Ż': 'Z', 'ą': 'a', 'Ą': 'A', 'ę': 'e', 'Ę': 'E',
    'ś': 's', 'Ś': 'S', 'ć': 'c', 'Ć': 'C', 'ő': 'o', 'Ő': 'O',
    'ű': 'u', 'Ű': 'U', 'ř': 'r', 'Ř': 'R', 'ğ': 'g', 'Ğ': 'G',
}

# Explicit status / current-club corrections for players whose Transfermarkt
# snapshot row is stale. Values are (club, league).
STATUS_OVERRIDES = {
    'sebastian-coates': (False, 'Nacional', 'Uruguayan Primera'),
    'wissam-ben-yedder': (False, 'Wydad AC', 'Botola Pro'),
    'mario-fernandes': (False, 'CSKA Moscow', 'Russian Premier League'),
    'marco-verratti': (False, 'Al-Duhail', 'Qatar Stars League'),
    'lei-wu': (False, 'Shanghai Port', 'Chinese Super League'),
    'xavi-simons': (False, 'Tottenham Hotspur', 'Premier League'),
    'inaki-pena': (False, 'Barcelona', 'La Liga'),
    'lorenzo-insigne': (False, 'Toronto', 'MLS'),
    'marcel-halstenberg': (False, 'Hannover 96', '2. Bundesliga'),
    'aleksandr-kokorin': (False, 'Aris Limassol', 'Cypriot First Division'),
}

# Clubs whose league cannot be looked up from clubs.csv (non-European leagues).
CLUB_LEAGUE_OVERRIDES = {
    'Wydad AC': 'Botola Pro',
    'Al-Duhail': 'Qatar Stars League',
    'Shanghai Port': 'Chinese Super League',
    'Nacional': 'Uruguayan Primera',
    'Al-Arabi': 'Qatar Stars League',
    'Orlando City': 'MLS',
    'Qatar SC': 'Qatar Stars League',
    'Al Sadd': 'Qatar Stars League',
    'Shabab Al-Ahli': 'UAE Pro League',
}


# Regex to detect youth/reserve teams
YOUTH_RE = re.compile(
    r'(\bU\s*\d{1,3}\b|\bY\s*\d{1,3}\b|\bSub[- ]\d{1,2}\b|\bYth\.?\b|\bYouth\b|\bYout\b|\bYou\b|\bY\b|'
    r'\bYt\b|\bYo\b|\bAca\.?\b|\bAcad\.?\b|\bAcademy\b|\bFo\.?\b|\bFr\.?\b|'
    r'\bRes\.?\b|\bReser\.?\b|\bReserve[s]?\b|\bJug\.?\b|\bJugend\b|\bFor\.?\b|'
    r'\bForm\.?\b|\bFormation\b|\bFormação\b|\bJuvenil\b|\bJV\b|\bJun\.?\b|'
    r'\bPrimavera\b|\bPrimaver\b|\bII\b|\bIII\b|\bJgd?\.?\b|\bJg\.?\b|\bJong\b|'
    r'\bCastilla\b|\bAtlètic\b|\bFutures\b|\bGio\.?\b|\bGiov\.?\b|\bGiovanili\b|\bJuv\.?\b|'
    r'\bCJ\b|\bS\s*\d{1,3}\b|\b B\b|\b C\b|\bUniv\.?\b|\bJu\b|\bTFF\b|'
    r'\bJeugd\b|\bM-?\d{1,2}\b|\bAtl\.?$|\bJ\.$|\bG\.$|\s[23]$)',
    re.IGNORECASE
)

DATE_SUFFIX_RE = re.compile(r'\s*\(\s*-?\s*\d{0,4}\s*\)\s*$', re.IGNORECASE)

# Transfermarkt truncates club names to ~15 characters. Expand the senior
# clubs we know; values of '' are youth/reserve/amateur sides that add noise.
TRUNCATED_CLUB_NAMES = {
    'scunthorpe utd.': 'Scunthorpe United',
    'hereford utd.': 'Hereford United',
    'welling utd.': 'Welling United',
    'maidenhead utd.': 'Maidenhead United',
    'cambridge utd.': 'Cambridge United',
    'colchester utd.': 'Colchester United',
    'yokohama f. m.': 'Yokohama F. Marinos',
    'gimnàstic de ta': 'Gimnàstic de Tarragona',
    'gimnastic de ta': 'Gimnàstic de Tarragona',
    'indep. santa fe': 'Independiente Santa Fe',
    'weston-super-m.': 'Weston-super-Mare',
    'metalurg d.': 'Metalurg Donetsk',
    'metalurg z.': 'Metalurg Zaporizhzhia',
    'oriente p.': 'Oriente Petrolero',
    'cp rapid buc.': 'Rapid București',
    'montecchio mag.': 'Montecchio Maggiore',
    'rush. & diamon.': 'Rushden & Diamonds',
    'matsumoto yama.': 'Matsumoto Yamaga',
    'cq dangdai lif.': 'Chongqing Dangdai Lifan',
    'chacarita jrs.': 'Chacarita Juniors',
    'tokushima vort.': 'Tokushima Vortis',
    'lada-sok dimitr.': '',
    'jamba f.a.': 'Jamba FC',
    'mississauga f.': 'Mississauga FC',
    'west chester a.': '',
    'vauban s.': '',
    "bishop's st.": "Bishop's Stortford",
    'rdyussh makh.': '',
    'portimonense 23': '',
    'b sad': 'Belenenses',
    'fc mk': 'FC MK',
    'hn fc': 'Henan FC',
    'sz fc': 'Shenzhen FC',
    'b': 'Belenenses',
    'mk': 'FC MK',
    'hn': 'Henan FC',
    'sz': 'Shenzhen FC',
    'sacavenense f.': '',
    'cb estarreia f.': '',
    'cb estarreja f.': '',
    'mãe d´água fr.': '',
    'p. brandão fo.': '',
    'dragon force f.': '',
    'donatello giov.': '',
}

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
    'футбольный клуб "локомотив" москва': 'Lokomotiv Moscow',
    'футбольный клуб локомотив москва': 'Lokomotiv Moscow',
    'фк локомотив москва': 'Lokomotiv Moscow',
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
    'oscar': ['São Paulo', 'Internacional', 'Chelsea', 'Shanghai Port', 'São Paulo'],
    'renato-augusto': ['Bayer Leverkusen', 'Corinthians', 'Beijing Guoan', 'Corinthians', 'Fluminense'],
    'jemerson': ['Atlético Mineiro', 'Monaco', 'Corinthians', 'Grêmio'],
    'diego-alves': ['Atlético Mineiro', 'Almería', 'Valencia', 'Flamengo', 'Celta de Vigo'],
    'luis-garcia': ['Barcelona', 'Liverpool', 'Atlético Madrid', 'Racing Santander', 'Panathinaikos', 'Pumas', 'Atlético Kolkata', 'KAS Eupen'],
    'nacho-monreal': ['Osasuna', 'Málaga', 'Arsenal', 'Real Sociedad'],
    'javi-martinez': ['Athletic Club', 'Bayern Munich', 'Qatar SC'],
    'dario-benedetto': ['Arsenal de Sarandí', 'Boca Juniors', 'América', 'Boca Juniors', 'Marseille', 'Boca Juniors', 'Querétaro', "Newell's Old Boys"],
    'guido-pizarro': ['Lanús', 'Tigres UANL', 'Sevilla', 'Tigres UANL'],
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

DEATH_YEARS = {
    'diego-maradona': 2020,
    'pele': 2022,
    'johan-cruyff': 2016,
    'franz-beckenbauer': 2024,
    'lev-yashin': 1990,
    'ferenc-puskas': 2006,
    'gerd-muller': 2021,
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

def to_ascii(name: str) -> str:
    """Best-effort ASCII transliteration for search and club matching."""
    name = ''.join(ASCII_TRANSLIT.get(ch, ch) for ch in name)
    nfd = unicodedata.normalize('NFKD', name)
    return ''.join(c for c in nfd if not unicodedata.combining(c))


def club_key(name: str) -> str:
    """Lenient key used to collapse club aliases (FC Basel 1893 -> basel)."""
    s = to_ascii(name or '').lower().replace('&', ' and ')
    s = re.sub(r'^(club|fc|afc|cf|sc|ac|as|ss|ssc|ssd|rc|rcd|ca|cd|ud|sv|vfb|vfl|tsg|fsv|ao|fk)\s+', '', s)
    s = re.sub(r'^\d+\.\s*', '', s)
    s = re.sub(
        r'\b(fc|afc|cf|sc|ac|as|ss|ssc|ssd|rc|rcd|ca|cd|ud|sv|vfb|vfl|tsg|fsv|kv|'
        r'club|calcio|football|futbol|futebol|fußballclub|fussballclub|societa|sportiva|sad|spa|srl|plc|llc|'
        r'the|de|do|da)\b',
        ' ', s,
    )
    s = re.sub(r'\b(18|19|20)\d{2}\b', ' ', s)
    return re.sub(r'[^a-z0-9]+', '', s)


CANONICAL_BY_KEY = {club_key(k): v for k, v in CANONICAL_CLUBS.items()}


def clean_club_name(name: str) -> str:
    if not name:
        return ''

    low = name.strip().lower()
    if low in INVALID_CLUBS or 'without club' in low or 'unknown' in low:
        return ''

    # Strip dissolution date suffix like "(-2020)" or malformed "( -)".
    name = DATE_SUFFIX_RE.sub('', name).strip()

    low = name.lower()
    if low in TRUNCATED_CLUB_NAMES:
        return TRUNCATED_CLUB_NAMES[low]
    if low in KNOWN_EXPANSIONS:
        name = KNOWN_EXPANSIONS[low]
        low = name.lower()

    # Guard Paris FC before stripping FC!
    if low == 'paris fc':
        return 'Paris FC'

    # Check if youth / reserve / amateur formation
    if YOUTH_RE.search(name):
        return ''

    # Remove leading numbers and corporate/legal noise from both ends.
    name = re.sub(r'^\d+\.\s*', '', name)
    name = re.sub(
        r'^(Società Sportiva|Associazione Calcio|Futbol Club|Fútbol Club|'
        r'Club Internacional de Fútbol|Football Club|Club)\s+',
        '', name, flags=re.IGNORECASE,
    )
    name = re.sub(r'\s+(S\.p\.A\.|F\.C\.|FC|CF|C\.F\.|SAD|plc|e\.V\.|LLC)\s*$', '', name, flags=re.IGNORECASE)
    name = re.sub(
        r'\b(FC|CF|SC|AFC|AC|KV|Calcio|Football Club|Fútbol Club|Futebol Club|'
        r'Fußballclub|Fussballclub|Club)\b',
        '', name, flags=re.IGNORECASE,
    )
    name = re.sub(r'\b(18|19|20)\d{2}\b', '', name)
    name = re.sub(r'\s+', ' ', name).strip(' -,')

    if not name:
        return ''

    k = club_key(name)
    if k in CLUB_ALIASES:
        return CLUB_ALIASES[k]
    if k in CANONICAL_BY_KEY:
        return CANONICAL_BY_KEY[k]
    if name.lower() in CANONICAL_CLUBS:
        return CANONICAL_CLUBS[name.lower()]
    return name

def image_metadata(url: str, profile_url: str = ''):
    """Return (attribution, license, sourceUrl) for an image URL."""
    if not url:
        return None, None, None
    low = url.lower()
    if 'transfermarkt' in low:
        source = profile_url or ''
        if '/profil/spieler/' not in source:
            match = re.search(r'/(\d+)-\d+\.\w+', url)
            source = (
                f'https://www.transfermarkt.com/-/profil/spieler/{match.group(1)}'
                if match else (source or url)
            )
        return (
            'Transfermarkt',
            'All rights reserved – Transfermarkt portrait (see source)',
            source,
        )
    if 'wikimedia' in low or 'wikipedia' in low:
        return (
            'Wikimedia Commons',
            'See Wikimedia Commons file page for license',
            url,
        )
    return 'Unknown', 'See source page for license', profile_url or url


print("1. Loading clubs lookup...")
club_id_to_name = {}
club_name_to_league = {}
with open('data/transfermarkt/clubs.csv', mode='r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        cname = clean_club_name(row.get('name', ''))
        club_id_to_name[row['club_id']] = cname
        if cname:
            comp_league = LEAGUE_MAP.get(row.get('domestic_competition_id', ''), 'Other League')
            existing = club_name_to_league.get(club_key(cname))
            if existing is None or existing == 'Other League':
                club_name_to_league[club_key(cname)] = comp_league

print("2. Loading chronological transfer events from transfers.csv...")
# Map: pid -> list of (transfer_date, from_club, to_club)
player_transfers = {}
retired_transfer_ids = set()
with open('data/transfermarkt/transfers.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        pid = row['player_id']
        t_date = row.get('transfer_date') or '1970-01-01'
        fc = clean_club_name(row.get('from_club_name', ''))
        tc = clean_club_name(row.get('to_club_name', ''))
        if 'retired' in (row.get('to_club_name') or '').lower():
            retired_transfer_ids.add(pid)
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
# Preload existing verified Wikimedia image URLs so we never use Transfermarkt copyrighted images
existing_images = {}
try:
    with open('src/data/footballers.json', 'r', encoding='utf-8') as f:
        for p in json.load(f):
            if p.get('imageUrl') and ('wikimedia.org' in p['imageUrl'] or 'wikipedia.org' in p['imageUrl']):
                existing_images[p['id']] = {
                    'imageUrl': p['imageUrl'],
                    'imageAttribution': p.get('imageAttribution', 'Wikimedia Commons'),
                    'imageLicense': p.get('imageLicense', 'Creative Commons / Public Domain'),
                    'sourceUrl': p.get('sourceUrl', ''),
                }
except Exception:
    pass

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

        # Reconstruct career chronologically by merging transfers and valid
        # appearance clubs. Appearances where the player's club id is actually
        # the opponent (e.g. Saka -> Vorskla Poltava) are filtered out because
        # they are single appearances for a club absent from the transfer list.
        pid = row['player_id']
        t_events = sorted(player_transfers.get(pid, []), key=lambda x: x[0])
        app_events = player_appearances.get(pid, [])

        app_counts = {}
        app_first = {}
        for a_date, cname in app_events:
            if not cname:
                continue
            app_counts[cname] = app_counts.get(cname, 0) + 1
            if cname not in app_first or a_date < app_first[cname]:
                app_first[cname] = a_date

        transfer_clubs = set()
        for _, fc, tc in t_events:
            if fc:
                transfer_clubs.add(fc)
            if tc:
                transfer_clubs.add(tc)

        career_events = []
        for t_date, fc, tc in t_events:
            if fc:
                career_events.append((t_date, 0, fc))
            if tc:
                career_events.append((t_date, 1, tc))
        for cname, first_date in app_first.items():
            if cname in transfer_clubs or app_counts[cname] >= 2:
                career_events.append((first_date, 1, cname))

        career_events.sort(key=lambda x: (x[0], x[1]))
        career_sequence = []
        for _, _, cname in career_events:
            cname = clean_club_name(cname)
            if not cname:
                continue
            if not career_sequence or club_key(career_sequence[-1]) != club_key(cname):
                career_sequence.append(cname)

        # Curated senior careers are a safer fallback for older players whose
        # Transfermarkt rows are sparse.
        if slug in LEGACY_CAREERS:
            legacy = [clean_club_name(c) for c in LEGACY_CAREERS[slug]]
            legacy = [c for c in legacy if c]
            if len(legacy) > len(career_sequence):
                career_sequence = legacy

        is_ret = (
            pid in retired_transfer_ids
            or (last_season <= 2023 and age >= 35)
        )

        if slug in STATUS_OVERRIDES:
            is_ret, override_club, override_league = STATUS_OVERRIDES[slug]
            current_club = override_club
            league = override_league
        else:
            if is_ret:
                current_club = career_sequence[-1] if career_sequence else current_club
            else:
                current_club = career_sequence[-1] if career_sequence else current_club
            league = club_name_to_league.get(
                club_key(current_club),
                LEAGUE_MAP.get(comp_id, 'Other League'),
            )

        if current_club in CLUB_LEAGUE_OVERRIDES:
            league = CLUB_LEAGUE_OVERRIDES[current_club]

        # The answer's current club must never leak into previousClubs. Other
        # genuine repeat spells (e.g. Chelsea loans) are preserved in order.
        previous_clubs = [
            c for c in career_sequence
            if club_key(c) != club_key(current_club)
        ]

        # Final guard: no aliases, no repeats, no placeholders. A player's
        # career clue is a chronological list of unique clubs, not every loan
        # return, so collapse repeat spells by canonical club key.
        cleaned_prev = []
        seen_clubs = set()
        for c in previous_clubs:
            c = clean_club_name(c)
            if not c:
                continue
            key = club_key(c) or c.lower()
            display = c.lower()
            if key in seen_clubs or display in seen_clubs:
                continue
            if cleaned_prev and club_key(cleaned_prev[-1]) == club_key(c):
                continue
            seen_clubs.add(key)
            seen_clubs.add(display)
            cleaned_prev.append(c)
        previous_clubs = cleaned_prev

        # Disambiguate mononyms
        disp_name = name
        full_name = name
        alt_names = [name]
        
        if slug in MONONYM_OVERRIDES:
            ov = MONONYM_OVERRIDES[slug]
            disp_name = ov['displayName']
            full_name = ov['fullName']
            alt_names = list(ov['alternativeNames'])
        
        # Ensure display name is always in alternative names, and add an ASCII
        # variant so "Odegaard", "Hojlund", "Gross" etc. are searchable.
        def add_alt(value):
            if value and value not in alt_names:
                alt_names.append(value)

        for base_name in [disp_name, full_name, *list(alt_names)]:
            add_alt(base_name)
            add_alt(to_ascii(base_name))

        if slug in NICKNAMES:
            for nick in NICKNAMES[slug]:
                add_alt(nick)

        difficulty = 'Easy' if highest_mv >= 40000000 else ('Medium' if highest_mv >= 15000000 else 'Hard')
        
        # Only use verified free Wikimedia images; do not hotlink copyrighted Transfermarkt portraits
        existing_wm = existing_images.get(slug)
        if existing_wm:
            image_url = existing_wm['imageUrl']
            image_attribution = existing_wm.get('imageAttribution') or 'Wikimedia Commons'
            image_license = existing_wm.get('imageLicense') or 'Creative Commons / Public Domain'
            image_source = existing_wm.get('sourceUrl') or ''
        else:
            image_url = ''
            image_attribution = None
            image_license = None
            image_source = row.get('url') or ''

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
            'imageAttribution': image_attribution,
            'imageLicense': image_license,
            'sourceUrl': image_source,
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
    'samuel-etoo': ('Qatar SC', 'Qatar Stars League'),
    'iker-casillas': ('Porto', 'Primeira Liga'),
    'gianluigi-buffon': ('Parma', 'Serie A'),
    'peter-schmeichel': ('Manchester City', 'Premier League'),
    'oliver-kahn': ('Bayern Munich', 'Bundesliga'),
    'carles-puyol': ('Barcelona', 'La Liga'),
    'alessandro-nesta': ('Chennaiyin', 'Other League'),
    'fabio-cannavaro': ('Al-Ahli Dubai', 'UAE Pro League'),
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
    'gabriel-batistuta': ('Al-Arabi', 'Qatar Stars League'),
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
        clean_leg['isRetired'] = True
        if lid in APPROACH_B_LEGENDS:
            last_club, last_league = APPROACH_B_LEGENDS[lid]
            clean_leg['currentClub'] = clean_club_name(last_club) or last_club
            clean_leg['league'] = CLUB_LEAGUE_OVERRIDES.get(clean_leg['currentClub'], last_league)

            # Reconstruct previousClubs excluding the final club by key, which
            # also removes alias spellings of the same club.
            orig_prev = list(clean_leg.get('previousClubs', []))
            clean_prev = []
            for c in orig_prev:
                c_clean = clean_club_name(c)
                if not c_clean:
                    continue
                if club_key(c_clean) == club_key(clean_leg['currentClub']):
                    continue
                if not clean_prev or club_key(clean_prev[-1]) != club_key(c_clean):
                    clean_prev.append(c_clean)
            clean_leg['previousClubs'] = clean_prev
        else:
            clean_leg['currentClub'] = clean_club_name(clean_leg.get('currentClub', ''))
            clean_leg['previousClubs'] = [
                c for c in (clean_club_name(x) for x in clean_leg.get('previousClubs', [])) if c
            ]

        if lid in LEGEND_METADATA:
            clean_leg['age'] = LEGEND_METADATA[lid][0]
            clean_leg['birthYear'] = LEGEND_METADATA[lid][1]
        if lid in DEATH_YEARS:
            clean_leg['deathYear'] = DEATH_YEARS[lid]

        # Deceased icons carry isActive: false
        if lid in DECEASED_ICONS:
            clean_leg['isActive'] = False
        else:
            clean_leg['isActive'] = True

        # Ensure displayName/fullName and their ASCII forms are searchable.
        disp = clean_leg['displayName']
        full = clean_leg.get('fullName', disp)
        alts = list(clean_leg.get('alternativeNames', []))
        for value in [disp, full, *alts]:
            if value and value not in alts:
                alts.append(value)
            ascii_value = to_ascii(value) if value else ''
            if ascii_value and ascii_value not in alts:
                alts.append(ascii_value)
        if disp not in alts:
            alts.insert(0, disp)
        clean_leg['alternativeNames'] = alts

        img_attr, img_license, img_source = image_metadata(
            clean_leg.get('imageUrl', ''),
            clean_leg.get('sourceUrl', '') or clean_leg.get('imageUrl', ''),
        )
        clean_leg['imageAttribution'] = img_attr
        clean_leg['imageLicense'] = img_license
        clean_leg['sourceUrl'] = img_source

        final_players.append(clean_leg)

# Normalize each current club to a single league. Transfermarkt sometimes
# assigns a stale competition id to a club row, so use the majority league
# observed for that club across the selected players.
club_league_votes = {}
for p in players:
    key = club_key(p['currentClub'])
    club_league_votes.setdefault(key, {})
    club_league_votes[key][p['league']] = club_league_votes[key].get(p['league'], 0) + 1

majority_league = {
    key: max(votes.items(), key=lambda kv: (kv[1], kv[0] != 'Other League'))[0]
    for key, votes in club_league_votes.items()
}
for p in players:
    key = club_key(p['currentClub'])
    if key in majority_league and p['currentClub'] not in CLUB_LEAGUE_OVERRIDES:
        p['league'] = majority_league[key]

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
import os
output_path = os.environ.get('FOOTBALLERS_OUT', 'src/data/footballers.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_players, f, indent=2, ensure_ascii=False)

print(f"Saved cleanly to {output_path}!")
