Required
--------------
Country - ALL for all
Callback name
thresholdProb
minProb
maxProb
startDateIndex
dateCount
regions - [] for all


Optional
----------------
thresholdProb, also specify same for minProb and maxProb as 100
limit - 0 means all, default is 0


defaults
------
f (json)

Sample URL

http://gis-stage.wri.org:8080/forma-download/api?country=ALL&minProb=0&maxProb=100&startDateIndex=0&dateCount=179&f=json&output=CSV&regions=[0] // 0 = all

http://gis-stage.wri.org:8080/forma-download/api?country=BLZ&minProb=80&maxProb=100&startDateIndex=0&dateCount=179&f=json&output=CS	V&regions=[6149]


http://alb:8080/forma-download/api?country=PER&minProb=0&maxProb=100&startDateIndex=0&dateCount=179&f=json&output=CSV&regions=[] // empty regions means all 
http://alb:8080/forma-download/api?country=BLZ&minProb=0&maxProb=100&startDateIndex=0&dateCount=179&f=json&output=CSV&regions=[6149] // empty regions means all 
http://alb:8080/forma-download/api?minProb=0&maxProb=100&startDateIndex=0&dateCount=179&f=json&output=CSV // no countries means all countries


http://alb:8080/forma-download/api?country=IDN&thresholdProb=50&minProb=0&maxProb=100&startDateIndex=0&dateCount=182&f=json&output=CSV&regions=[]&email=aamirsul@gmail.com // thresholdProb will get the date at this threshold was reached