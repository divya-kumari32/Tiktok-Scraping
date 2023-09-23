import csv
import time
from selenium import webdriver
from selenium_stealth import stealth
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

options = webdriver.ChromeOptions()
options.add_argument("start-maximized")

options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)

stealth(driver,
        languages=["en-US", "en"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
        )

driver.maximize_window()

with open('videolinks.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    urls = [row["video_link"] for row in reader]
    print(urls)

for url in urls:

    driver.get(url)

    # Wait for the video to load
    time.sleep(60)

    # Find the video element
    video_element = driver.find_element_by_xpath("//video")

    # Right-click the video element
    ActionChains(driver).context_click(video_element).perform()

    # Click the "Save video as..." option in the context menu
    save_video_option = driver.find_element(By.XPATH, "//*/span[text()='Download video']")
    save_video_option.click()

    # Wait for the file download to complete
    time.sleep(10)

    print(url)






