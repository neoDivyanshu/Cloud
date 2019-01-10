import sys
import logging
import pymysql
import json

#config file containing credentials for rds mysql instance
name = ""
password = ""
db_name = ""
rds_host = ""
port = 3306
logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(rds_host, user=name,
                           passwd=password, db=db_name, connect_timeout=5)
except:
    logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
    sys.exit()

logger.info("SUCCESS: Connection to RDS mysql instance succeeded")

def lambda_handler(event, context):
    # TODO implement
    item_count = 0
    with conn.cursor() as cur:
        cur.execute("call chatBotsTop()")
        #result = "{'restaurants':["
        result = '{"restaurants": ['
        for row in cur:
            item_count += 1
            if result == '{"restaurants": [':
                result = result + '{"Img_url": "' + row[0] + '", "Rest_name": "' + row[1] + '", "Rating": ' + str(row[2]) + ', "Review_count": ' + str(row[3]) + ', "Price": "' + row[4] + '", "Phone_number": "' + row[5] + '"}'
            else:
                result = result + ', ' + '{"Img_url": "' + row[0] + '", "Rest_name": "' + row[1] + '", "Rating": ' + str(row[2]) + ', "Review_count": ' + str(row[3]) + ', "Price": "' + row[4] + '", "Phone_number": "' + row[5] + '"}'
                #logger.info(row)
        result = result + ']}'
        logger.info(result)
    return result
