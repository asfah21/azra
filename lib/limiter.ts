//Batasi request api 
import rateLimit from 'next-rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 menit
  uniqueTokenPerInterval: 100, // max 100 email berbeda per menit
})

export default limiter
