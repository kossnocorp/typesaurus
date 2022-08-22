import * as admin from 'firebase-admin'
import serviceKey from '../secrets/key.json'

admin.initializeApp(
  serviceKey && {
    credential: admin.credential.cert(serviceKey as admin.ServiceAccount)
  }
)
