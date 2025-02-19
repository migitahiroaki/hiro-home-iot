import requests
import bs4
import re
from logging import Logger


class HtmlParser:
    # e.g 浄水場前 （16:48着予定）
    STOP_AND_TIME_REGEX = r"（(\d{1,2}:\d{2})着予定）"
    DEFAULT_RESULT_SIZE = 5
    STOP_NAME_SELECTOR = "#main > div.wrap > div.frameBox01 > p.text"
    KEITO_STRING = "系統"
    ARRIVAL_CLASS = "placeArea01 departure"

    def __init__(self, logger: Logger, url: str) -> None:
        logger.debug(url)
        self.regex = re.compile(HtmlParser.STOP_AND_TIME_REGEX)
        self.logger = logger
        self.url = url
        pass

    def parse_arrival_time(self, expected_stop_name: str, arrival_str: str) -> str:
        separated = arrival_str.split()
        actual_stop_name = separated[0]
        if actual_stop_name != expected_stop_name:
            self.logger.warn(
                f"パースしたバス停 '{actual_stop_name}' が '{expected_stop_name}' と一致しない"
            )
        arrival_time = "dummy"

        match separated.__len__():
            # 時刻情報がない場合
            case 1:
                arrival_time = "時刻不明"
            # 時刻情報がある場合
            case 2:
                # 時刻をパース
                match_result = self.regex.match(separated[1])
                # パース成功
                if match_result and isinstance(match_result.group(1), str):
                    arrival_time = match_result.group(1)
                # パース失敗
                else:
                    raise ValueError(
                        f"時刻文字列'{arrival_str}' は正規表現'{self.regex}' にマッチしない match: {match_result}",
                    )
            case _:
                IndexError(f"区切りが不正な文字列 {arrival_str}")
        return arrival_time

    def get_request(self):
        response = requests.get(self.url)
        self.logger.debug(response)
        response.encoding = response.apparent_encoding
        return response.text

    def format_result(
        self,
        stop_name: str,
        keito_list: list[str],
        arrival_list: list[str],
        size: int,
    ):
        if arrival_list.__len__() == 0:
            return "バス情報が見つかりませんでした。"

        if arrival_list.__len__() != keito_list.__len__():
            raise IndexError(f"到着情報{arrival_list} と 系統 {keito_list} の個数が不一致")

        arrival_keito_list: list[str] = []
        for i in range(arrival_list.__len__()):
            # e.g. "町24"
            arrival_keito_list.append(f"{arrival_list[i]}「{keito_list[i]}」")
        self.logger.info(f"result: {arrival_keito_list}")
        joined = "".join(
            [f"{n+1}番目、{item}。" for n, item in enumerate(arrival_keito_list[:size])]
        )
        result = f"「{stop_name}」の到着情報。{joined}"
        return result

    def get_bus_arrival_result(self, size=DEFAULT_RESULT_SIZE) -> str:
        html = self.get_request()
        soup = bs4.BeautifulSoup(html, "html.parser")
        stop_name = soup.select_one(HtmlParser.STOP_NAME_SELECTOR).text
        # 取得失敗しても時刻取得には問題ないので処理続行
        if not stop_name:
            self.logger.warn(f"バス停情報取得失敗 {stop_name}")
            stop_name = ""
        keito_list = []
        for th in soup.find_all(name="th", string=HtmlParser.KEITO_STRING):
            self.logger.debug(th)
            if isinstance(th, bs4.Tag):
                keito_list.append(th.find_next("td").get_text(strip=True))
            else:
                raise ValueError(f"th '{th}'がTag型でない")
        arrival_list = []

        for arrival in soup.find_all(class_=HtmlParser.ARRIVAL_CLASS):
            self.logger.debug(arrival)
            if isinstance(arrival, bs4.Tag):
                arrival_info = arrival.get_text(separator=" ", strip=True)
                self.logger.debug(arrival_info)
                arrival_list.append(
                    self.parse_arrival_time(
                        stop_name, arrival.get_text(separator=" ", strip=True)
                    )
                )
            else:
                raise ValueError(f"arrival '{arrival}'がTag型でない")

        return self.format_result(stop_name, keito_list, arrival_list, size)
