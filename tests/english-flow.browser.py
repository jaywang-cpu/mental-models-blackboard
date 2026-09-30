"""Interaction and layout checks for the static writing Gym.

Run with an HTTP preview on 127.0.0.1:8766 and Playwright installed.
Screenshots are saved outside the repository.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:8766'
OUT = Path('/tmp/english-flow-preview')
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, service_workers='block')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/english-flow.html')
    expect(page.locator('#draft')).to_be_visible()
    page.screenshot(path=str(OUT / 'desktop-writing.png'), full_page=True)
    assert page.locator('body').inner_text().find('开始写') >= 0
    expect(page.locator('#writing-hints')).to_be_empty()
    page.locator('[data-action="hint"]').click()
    expect(page.locator('.hint-row')).to_have_count(1)
    page.locator('[data-action="hint"]').click()
    expect(page.locator('.hint-row')).to_have_count(2)

    page.locator('#draft').fill('Does this makes sense? The model can learns from new data.')
    page.locator('[data-action="check"]').click()
    expect(page.locator('.issue')).to_have_count(2)
    page.locator('[data-action="fix"]').first.click()
    expect(page.locator('.issue')).to_have_count(1)
    page.locator('[data-action="fix"]').first.click()
    expect(page.locator('#draft')).to_have_value('Does this make sense? The model can learn from new data.')
    expect(page.locator('.issue')).to_have_count(0)
    expect(page.locator('#checks')).to_contain_text('不等于全文语法已通过')
    page.locator('[data-action="save-version"]').click()
    page.locator('[data-action="save-version"]').click()
    assert page.evaluate('JSON.parse(localStorage.getItem("english-writing-flow-v1")).sessions.length') == 1
    page.reload()
    expect(page.locator('#draft')).to_have_value('Does this make sense? The model can learn from new data.')
    page.locator('[data-action="scene"][data-id="coffee"]').click()
    expect(page.locator('#draft')).to_have_value('')
    page.locator('#draft').fill('I would like to get coffee this weekend.')
    page.locator('[data-action="scene"][data-id="research"]').click()
    assert page.locator('#draft').input_value().startswith('Does this')
    page.locator('#draft').fill('I want to 理解 this model.')
    page.locator('[data-action="check"]').click()
    expect(page.locator('.placeholder-note')).to_be_visible()
    page.locator('#draft').fill('I want to understand this model.')
    expect(page.locator('#checks')).to_be_empty()

    page.locator('[data-view="library"]').click()
    expect(page.locator('.brick-card')).to_have_count(28)
    page.locator('#library-search').fill('look forward')
    expect(page.locator('.brick-card')).to_have_count(1)
    page.locator('#library-search').fill('nothing-will-match-987654')
    expect(page.locator('.empty')).to_be_visible()
    page.locator('#library-search').fill('')
    page.locator('[data-action="filter"][data-id="verbs"]').click()
    expect(page.locator('.brick-card')).to_have_count(4)
    page.locator('[data-action="filter"][data-id="all"]').click()

    # Exercise every lesson through actual controls, including one wrong choice.
    lessons = page.evaluate('EnglishFlowData.bricks.map(b => ({id:b.id, answers:b.quizzes.map(q=>q.answer)}))')
    for lesson in lessons:
        page.locator(f'.brick-card[data-id="{lesson["id"]}"]').click()
        expect(page.locator('#lesson')).to_be_visible()
        for index, answer in enumerate(lesson['answers']):
            if index == 0 and lesson['id'] == 'do-base':
                wrong = (answer + 1) % 3
                page.locator(f'[data-action="answer"][data-index="{wrong}"]').click()
                expect(page.locator('.feedback')).to_contain_text('需要调整')
            page.locator(f'[data-action="answer"][data-index="{answer}"]').click()
            expect(page.locator('.feedback')).to_contain_text('接对了')
            page.locator('[data-action="next-question"]').click()
        expect(page.locator('.drill')).to_contain_text('本轮完成')
        page.locator('[data-action="close-lesson"]').click()
    assert page.evaluate('Object.values(JSON.parse(localStorage.getItem("english-writing-flow-v1")).practice).filter(p=>p.attempts===1).length') == 28
    assert page.evaluate('JSON.parse(localStorage.getItem("english-writing-flow-v1")).practice["do-base"].review') is True
    page.screenshot(path=str(OUT / 'desktop-library.png'), full_page=True)

    page.locator('.brick-card[data-id="trying"]').click()
    for answer in [1, 0]:
        page.locator(f'[data-action="answer"][data-index="{answer}"]').click()
        page.locator('[data-action="next-question"]').click()
    page.locator('[data-action="use-brick"]').click()
    expect(page.locator('#draft')).to_be_visible()
    expect(page.locator('.hint-row')).to_contain_text('trying')
    page.locator('#idea').fill('我希望写作更自然。')
    page.locator('#draft').fill('Keep this original draft.')
    page.locator('[data-action="save-version"]').click()

    page.locator('[data-view="build"]').click()
    for scene_id in page.evaluate('EnglishFlowData.scenes.map(s=>s.id)'):
        page.locator('#build-scene').select_option(scene_id)
        for slot in range(3):
            page.locator(f'[data-action="choose"][data-slot="{slot}"][data-index="1"]').click()
        text = page.locator('#built-output').inner_text()
        assert text == page.evaluate('EnglishFlowCore.compose(EnglishFlowData.scenes.find(s=>s.id===document.querySelector("#build-scene").value),[1,1,1])')
    page.locator('#build-scene').select_option('research')
    page.locator('[data-action="write-built"]').click()
    expect(page.locator('#draft')).to_be_visible()
    assert page.locator('#draft').input_value().startswith('I want to understand this model.')
    assert 'I noticed that' in page.locator('#draft').input_value()
    page.locator('[data-view="review"]').click()
    expect(page.locator('.review-row [data-action="lesson"][data-id="do-base"]')).to_be_visible()
    expect(page.locator('.saved-version')).to_have_count(2)
    page.locator('[data-action="resume"][data-id="custom"]').click()
    expect(page.locator('#draft')).to_have_value('Keep this original draft.')
    expect(page.locator('#idea')).to_have_value('我希望写作更自然。')

    # Stored writing is treated as text, including in saved versions.
    page.locator('#draft').fill('<img src=x onerror="window.injected=true">')
    page.locator('[data-action="save-version"]').click()
    page.locator('[data-view="review"]').click()
    page.locator('.saved-version').first.locator('summary').click()
    assert page.evaluate('window.injected === undefined')
    assert page.locator('.saved-version img').count() == 0
    with page.expect_download() as download_info:
        page.locator('[data-action="export"]').click()
    data = json.loads(Path(download_info.value.path()).read_text())
    assert data['version'] == 1 and len(data['sessions']) == 3
    assert not errors, errors
    context.close()

    # Screens and tap targets on phone and tablet.
    for name, width, height in [('phone', 390, 844), ('tablet', 834, 1194)]:
        context = browser.new_context(viewport={'width':width,'height':height}, is_mobile=True, has_touch=True, service_workers='block')
        page = context.new_page()
        page.goto(BASE + '/english-flow.html')
        expect(page.locator('#draft')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), name
        page.screenshot(path=str(OUT / (name+'-writing.png')), full_page=True)
        page.locator('[data-view="library"]').click()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), name+' library'
        page.locator('.brick-card[data-id="do-base"]').click()
        expect(page.locator('#lesson')).to_be_visible()
        page.screenshot(path=str(OUT / (name+'-lesson.png')), full_page=True)
        page.locator('[data-action="close-lesson"]').click()
        page.locator('[data-view="build"]').click()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), name+' builder'
        page.goto(BASE + '/english.html')
        expect(page.locator('.writing-link')).to_be_visible()
        page.locator('.writing-link').click()
        expect(page.locator('#draft')).to_be_visible()
        context.close()

    # Service worker should support opening the new page offline after one visit.
    context = browser.new_context(viewport={'width':1280,'height':900})
    page = context.new_page()
    page.goto(BASE + '/english-flow.html')
    page.evaluate('navigator.serviceWorker.ready')
    page.reload()
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    context.set_offline(True)
    page.reload()
    expect(page.locator('#draft')).to_be_visible()
    page.locator('[data-view="library"]').click()
    expect(page.locator('.brick-card')).to_have_count(28)
    context.close()
    browser.close()
    print('PASS: writing, scoped fixes, saved drafts and versions, 28 lessons / 56 questions, 9 builders, export, text escaping, phone/tablet layouts, entry link, offline cache.')
    print('Screenshots:', OUT)
