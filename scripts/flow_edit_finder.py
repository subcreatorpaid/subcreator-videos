import subprocess, json
from PIL import Image, ImageDraw, ImageFont
W,H=360,640; S=0.7; bw,bh=round(W*S/2)*2,round(H*S/2)*2; bx,by=round(92/3),round(262/3)
FONT='/home/claude/subcreator-videos/animator/public/Inter-ExtraBold.otf'
# header overlay + mask
bg=Image.new('RGB',(W,H),'#F5F5F2')
d=ImageDraw.Draw(bg); f=ImageFont.truetype(FONT,15); s=ImageFont.truetype(FONT,16)
tw=d.textlength('@subcreatorpaid',font=f); x0=(W-47-tw-8)/2-6
d.rounded_rectangle([x0,45,x0+22,67],6,fill='#0E0E10'); d.text((x0+11,56),'S',font=s,fill='#CDF24F',anchor='mm')
d.text((x0+30,56),'@subcreatorpaid',font=f,fill='#0E0E10',anchor='lm')
bg.save('bg.png')
m=Image.new('L',(bw,bh),0); ImageDraw.Draw(m).rounded_rectangle([0,0,bw-1,bh-1],20,fill=255); m.save('mask.png')
starts=[0,164,304,376,520,658]; total=794
dur=[(starts[i+1]-starts[i])/30 for i in range(5)]+[(total-658)/30]
src={0:'c1',1:'c5',2:'c3',3:'c6',4:'c4',5:'c2'}
FADE=0.15
inputs=[];fc=[]
for i in range(6):
    p=f'{src[i]}.mp4'; inputs+=['-i',p]
    sd=dur[i]+(FADE if i<5 else 0)
    # speed so that the useful part fits; cards scene (i==2) is sped up
    sp=1.3 if i==2 else 1.0
    fc.append(f'[{i}:v]setpts=PTS/{sp},fps=30,tpad=stop_mode=clone:stop_duration=3,trim=duration={sd:.3f},setpts=PTS-STARTPTS,scale={bw}:{bh}[v{i}]')
cur='v0'; off=0
for i in range(1,6):
    off+=dur[i-1]
    fc.append(f'[{cur}][v{i}]xfade=transition=fade:duration={FADE}:offset={off:.3f}[x{i}]'); cur=f'x{i}'
inputs+=['-loop','1','-i','bg.png','-loop','1','-i','mask.png','-i','/home/claude/subcreator-videos/animator/public/voice.wav']
fc.append(f'[{cur}]format=rgba[vv];[7:v]format=gray[m];[vv][m]alphamerge[rv]')
fc.append(f'[6:v][rv]overlay={bx}:{by}:shortest=1,format=yuv420p[out]')
cmd=['ffmpeg','-loglevel','error','-y']+inputs+['-filter_complex',';'.join(fc),'-map','[out]','-map','8:a','-t',f'{total/30:.3f}','-c:v','libx264','-crf','21','-c:a','aac','-b:a','128k','-movflags','+faststart','flow_pack_finder_360p.mp4']
print(subprocess.run(cmd,capture_output=True,text=True).stderr[-1500:])
