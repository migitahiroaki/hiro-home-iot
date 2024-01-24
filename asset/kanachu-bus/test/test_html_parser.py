from util import html_parser as hp
import logging
import os


def test_positive(mocker):
    logger = logging.getLogger(__name__)
    logger.setLevel("INFO")
    current_dir = os.path.dirname(__file__)
    html_file_path = os.path.join(current_dir, "resource", "positive_10records.html")
    with open(html_file_path, "r") as f:
        html = f.read()
        url = "https://google.com"
        html_parser = hp.HtmlParser(logger, url)
        mocker.patch("util.html_parser.HtmlParser.get_request", return_value=html)

        result = html_parser.get_bus_arrival_result(10)
        logger.info(result)

        assert (
            "「浄水場前」の到着情報。1番目、0:48「町27」。2番目、16:49「町39」。3番目、16:51「町30」。4番目、16:52「町26」。5番目、16:55「町24」。6番目、17:02「町29」。7番目、17:04「町24」。8番目、17:16「町30」。9番目、17:20「町26」。10番目、17:22「町37」。"
            == result
        )
