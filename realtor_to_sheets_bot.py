# single_window_realtor_to_sheets.py  –  v3
import time, re, pyautogui, pyperclip

# ───────────── user settings ─────────────
START_PAGE    = 15     # first pg-N you still need
LOAD_WAIT     = 6      # seconds Realtor page needs to render
JS_WAIT       = 1.2    # seconds JS needs after you press Enter
CONSOLE_DELAY = 7      # ← now 7-second pause after Console opens
ROWS_PER_PAGE = 20     # we know each TSV block has 20 rows
# ─────────────────────────────────────────

JS_SNIPPET = r"""
(() => {
  // helper — return the first non-blank value
  const firstNonBlank = (...vals) =>
        vals.find(v => (typeof v === 'string' ? v.trim() : v)) ?? '';

  const yearNow = new Date().getFullYear();

  // locate the agent array in the Next-JS payload
  const list =
        window.__NEXT_DATA__?.props?.pageProps?.bootstrapData?.clientAgents ??
        window.__NEXT_DATA__?.props?.pageProps?.pageData?.agents ??
        [];

  // map each agent to the 7-column TSV row
  const rows = list.map(a => {
    const sold  = a.recently_sold ?? a.sold ?? {};
    const active= a.for_sale_price ?? {};
    return [
      a.full_name,                                             // name
      firstNonBlank(                                           // phone
        a.phone?.number, a.primaryPhone?.number,
        a.phones?.[0]?.number, a.phone_numbers?.[0]?.number,
        a.contactPhones?.[0]?.number, a.office?.phones?.[0]?.number
      ),
      firstNonBlank(                                           // brokerage
        a.broker?.name, a.brokerageName, a.office?.name,
        a.company?.name, a.member_office?.office_name,
        a.brokerOffice?.name, a.franchise?.name
      ),
      sold.count ?? '',                                        // sold homes
      firstNonBlank(sold.min, active.min),                     // priceMin
      firstNonBlank(sold.max, active.max),                     // priceMax
      a.first_year ? yearNow - a.first_year : ''               // yearsExp
    ].join('\t');
  });

  // copy TSV to clipboard and echo result
  const tsv = rows.join('\n');
  console.table(rows.map(r => r.split('\t')));
  copy(tsv);                     // Chrome/Edge: TSV now on clipboard
  `${rows.length} agents copied to clipboard (TSV, no header row)`;
})();

"""

# helpers -----------------------------------------------------------
def hot(keys, pause=0.06):
    pyautogui.hotkey(*keys.split('+')); time.sleep(pause)

def paste(text, pause=0.06):
    pyperclip.copy(text); hot('ctrl+v', pause)

def bump_realtor_page(page):
    hot('ctrl+2', .2)                 # Realtor tab
    hot('ctrl+l', .1)                 # URL bar
    hot('ctrl+c', .1)
    url = pyperclip.paste()
    pyperclip.copy(re.sub(r'pg-(\d+)', f'pg-{page}', url, 1))
    hot('ctrl+v', .05); pyautogui.press('enter')

def run_js_and_copy():
    hot('ctrl+shift+j', 1.0)          # open Console
    time.sleep(CONSOLE_DELAY)         # wait 7 s
    paste(JS_SNIPPET, .1)
    pyautogui.press('enter')
    time.sleep(JS_WAIT)
    hot('ctrl+shift+j', .3)           # close Console
    return pyperclip.paste()

def paste_into_sheet():
    hot('ctrl+1', .2)                 # Sheet tab
    paste(pyperclip.paste(), .2)      # paste TSV block
    # move cursor down 20 rows to the next blank row
    pyautogui.press('down', presses=ROWS_PER_PAGE, interval=0.02)

# main loop ---------------------------------------------------------
def main():
    hot('alt+tab', 1.0)               # bring Chrome front-most
    page = START_PAGE
    while True:
        print(f'▶ Page {page}')
        bump_realtor_page(page)
        time.sleep(LOAD_WAIT)

        tsv = run_js_and_copy()
        if not tsv.strip():
            print('• No agents returned – stopping.')
            break
        print(f'• {ROWS_PER_PAGE} rows copied')

        paste_into_sheet()
        page += 1
        time.sleep(.6)

# runner ------------------------------------------------------------
if __name__ == '__main__':
    print(
        'Bot will Alt-Tab to Chrome automatically.\n'
        'Make sure ONE Chrome window is open with exactly two tabs:\n'
        '  1) Google Sheet – the blue outline on row 262 (blank)\n'
        '  2) Realtor pg-14 (DevTools closed)\n'
        'Press Enter in this terminal, then keep hands off.\n'
    )
    input('Ready? Press Enter to start… ')
    try:
        main()
    except KeyboardInterrupt:
        print('\nStopped by user.')
