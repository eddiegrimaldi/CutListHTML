@echo off
echo Attempting to upload fixed index.html via multiple methods...

echo Method 1: Standard FTP
curl.exe -T "index.html" ftp://u325921467.kettlebread.com/www.kettlebread.com/cutlist/index.html --user u325921467.kettlebread.com:@kH7Bs9X2

echo Method 2: Alternative FTP syntax  
curl.exe --upload-file "index.html" ftp://u325921467.kettlebread.com/www.kettlebread.com/cutlist/index.html --user u325921467.kettlebread.com:@kH7Bs9X2

echo Method 3: Passive FTP
curl.exe -T "index.html" --ftp-pasv ftp://u325921467.kettlebread.com/www.kettlebread.com/cutlist/index.html --user u325921467.kettlebread.com:@kH7Bs9X2

pause
