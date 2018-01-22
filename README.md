# Streamer-terminal

streams transactions to the terminal (built using (120 * X) as the standard width of terminal window)

creates a log file for any payments over 100k xrp (lgPymtlog.txt) line 361

creates a log file for any txs that arent payments (txlog.txt) line 64

plays a sound for:
  1 when txs that arent payments hit (line 46)
  2 when payments under 100k xrp or non xrp hit (line 416)
  3 when payments over 100k xrp hit (line 316)
  
  you can change these, just add a new sound file to ../home/x/Ripple/Streamer-Node/node_modules/sfx/sounds/
  and update the sfx.SOUNDNAME()
  
  also able to pull ripple trade names but i was never able to get the timing down, so its not active (line 387)
  
  npm install 
  launch--> node streamer.js
  quit --> ctrl c
