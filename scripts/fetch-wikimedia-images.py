#!/usr/bin/env python3
import json
import time
import urllib.parse
import urllib.request
import re

HEADERS = {
    'User-Agent': 'FootbleFootballTrivia/1.0 (https://footble.vercel.app; football-game@footble.vercel.app) python-urllib/3'
}

def query_mediawiki_batch(titles):
    """
    Query MediaWiki Action API for up to 50 titles at once with pilicense=free and redirects=1.
    Returns a dict mapping normalized title / requested title to image info.
    """
    if not titles:
        return {}
    
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
        'action': 'query',
        'format': 'json',
        'prop': 'pageimages',
        'piprop': 'thumbnail|original',
        'pilicense': 'free',
        'pithumbsize': 400,
        'redirects': '1',
        'titles': '|'.join(titles)
    })

    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  [API Error] {e}")
        return {}

    results = {}
    query = data.get('query', {})
    
    # Map redirect targets back to original inputs if needed
    redirect_map = {}
    for r in query.get('redirects', []):
        redirect_map[r['to']] = r['from']
        
    pages = query.get('pages', {})
    for page_id, page in pages.items():
        if page_id == '-1':
            continue
        title = page.get('title')
        orig_title = redirect_map.get(title, title)
        
        thumb = page.get('thumbnail', {})
        orig_img = page.get('original', {})
        
        img_url = thumb.get('source') or orig_img.get('source')
        if img_url:
            results[title] = img_url
            results[orig_title] = img_url

    return results

def main():
    print("Loading src/data/footballers.json...")
    with open('src/data/footballers.json', 'r', encoding='utf-8') as f:
        players = json.load(f)

    print(f"Total players in dataset: {len(players)}")

    already_wikimedia = 0
    needs_replacement = []
    
    for idx, p in enumerate(players):
        curr_url = p.get('imageUrl', '')
        if 'wikimedia.org' in curr_url or 'wikipedia.org' in curr_url:
            already_wikimedia += 1
        else:
            needs_replacement.append((idx, p))

    print(f"Already using Wikimedia: {already_wikimedia}")
    print(f"Needing free image replacement: {len(needs_replacement)}")

    # Round 1: Try displayName and fullName
    # We batch up to 40 per request to stay well within URL and query limits
    BATCH_SIZE = 40
    all_results = {}
    
    # Build list of queries: mapping query_title -> list of (player_idx, field_type)
    title_to_indices = {}
    for idx, p in needs_replacement:
        dn = p.get('displayName', '').strip()
        fn = p.get('fullName', '').strip()
        if dn:
            title_to_indices.setdefault(dn, []).append(idx)
        if fn and fn != dn:
            title_to_indices.setdefault(fn, []).append(idx)

    unique_titles = list(title_to_indices.keys())
    print(f"Querying Wikipedia API in batches for {len(unique_titles)} distinct player names...")

    for i in range(0, len(unique_titles), BATCH_SIZE):
        batch = unique_titles[i:i + BATCH_SIZE]
        batch_results = query_mediawiki_batch(batch)
        all_results.update(batch_results)
        print(f"  Processed {min(i + BATCH_SIZE, len(unique_titles))}/{len(unique_titles)} names... (Found: {len(all_results)})")
        time.sleep(0.3)  # Respect polite request rate limit

    # Check which players still don't have an image and try disambiguation like "Name (footballer)"
    unresolved_players = []
    found_count = 0

    for idx, p in needs_replacement:
        dn = p.get('displayName', '').strip()
        fn = p.get('fullName', '').strip()
        
        img = all_results.get(dn) or all_results.get(fn)
        if img:
            p['imageUrl'] = img
            p['imageAttribution'] = 'Wikimedia Commons'
            p['imageLicense'] = 'Creative Commons / Public Domain'
            p['sourceUrl'] = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(dn.replace(' ', '_'))}"
            found_count += 1
        else:
            unresolved_players.append((idx, p))

    print(f"Round 1 completed. Found {found_count} images. Attempting '(footballer)' fallback for {len(unresolved_players)} players...")

    # Round 2: Fallback for ambiguous names: "Name (footballer)"
    disambig_to_indices = {}
    for idx, p in unresolved_players:
        dn = p.get('displayName', '').strip()
        if dn:
            disambig_name = f"{dn} (footballer)"
            disambig_to_indices.setdefault(disambig_name, []).append((idx, dn))

    disambig_titles = list(disambig_to_indices.keys())
    disambig_results = {}
    for i in range(0, len(disambig_titles), BATCH_SIZE):
        batch = disambig_titles[i:i + BATCH_SIZE]
        batch_results = query_mediawiki_batch(batch)
        disambig_results.update(batch_results)
        print(f"  Processed {min(i + BATCH_SIZE, len(disambig_titles))}/{len(disambig_titles)} disambiguated names...")
        time.sleep(0.3)

    for disambig_title, img_url in disambig_results.items():
        if img_url:
            for idx, dn in disambig_to_indices.get(disambig_title, []):
                p = players[idx]
                if not p.get('imageUrl') or 'transfermarkt' in p.get('imageUrl'):
                    p['imageUrl'] = img_url
                    p['imageAttribution'] = 'Wikimedia Commons'
                    p['imageLicense'] = 'Creative Commons / Public Domain'
                    p['sourceUrl'] = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(disambig_title.replace(' ', '_'))}"
                    found_count += 1

    # Final pass: Any remaining player with a Transfermarkt URL must be CLEARED
    # to protect against copyright claims and fall back to safe Image-Free mode.
    cleared_count = 0
    final_wm_count = 0
    for p in players:
        curr_url = p.get('imageUrl', '')
        if 'transfermarkt' in curr_url.lower():
            p['imageUrl'] = ''
            p['imageAttribution'] = None
            p['imageLicense'] = None
            cleared_count += 1
        elif 'wikimedia.org' in curr_url or 'wikipedia.org' in curr_url:
            final_wm_count += 1

    print("\n" + "="*50)
    print("REPLACEMENT SUMMARY:")
    print(f"Total players in database: {len(players)}")
    print(f"Verified Free Wikimedia photos: {final_wm_count}")
    print(f"Cleared to Image-Free Mode (no free photo found): {cleared_count}")
    print(f"Remaining Transfermarkt copyrighted images: {sum(1 for p in players if 'transfermarkt' in p.get('imageUrl', ''))}")
    print("="*50)

    with open('src/data/footballers.json', 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2, ensure_ascii=False)

    print("Successfully saved updated src/data/footballers.json!")

if __name__ == '__main__':
    main()
