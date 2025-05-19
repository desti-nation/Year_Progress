@echo off
echo 正在推送代码到GitHub...
cd /d "D:\04-Product\年度进度条" 
git push origin main
echo 如果推送失败，请尝试以下命令：
echo git push --force origin main
pause