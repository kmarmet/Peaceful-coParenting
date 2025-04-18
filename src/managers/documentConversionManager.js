import FirebaseStorage from '../database/firebaseStorage'
import ImageManager from './imageManager'
import StringManager from './stringManager'
import AlertManager from './alertManager'

const DocumentConversionManager = {
  tocHeaders: [
    'income tax exemptions',
    'child support',
    'spousal maintenance',
    'matrimonial home',
    'assets',
    'debts',
    'equitable distribution release',
    'dower courtesy and homestead release',
    'living separate and apart',
    'interference',
    'child custody',
    'estate and testamentary disposition',
    'pension release',
    'general release',
    'general provisions',
    'acknowledgement',
    'division of property',
    'real estate',
    'household goods and furnishings',
    'motor vehicles',
    'financial accounts',
    'incomes taxes',
    'definitions',
    'the distribution',
    'mutual releases indemnification and litigation',
    'custody and visitation',
    'spousal support',
    'the family residence',
    'retirement benefits',
    'husbands separate property',
    'wifes separate property',
    'severability and enforceability',
    'law applicable',
    'introductory provisions',
    'property',
    'purpose of agreement',
    'the parties',
    'the marriage',
    'separation date',
    'armed forces',
    'name change',
    'minor children',
    'financial disclosure',
    'health insurance',
    'marital home',
    'husbands"s property',
    'wife"s liabilities debts',
    'payment to balance division',
    'ground for legal separation',
    'assets disclosure',
    'other property provisions',
    'liabilities disclosure',
    'undisclosed gifts',
    'future liabilities',
    'release of liabilities and claims',
    'status of temporary orders',
    'waiver of rights on death of other spouse',
    'reconciliation',
    'modification by subsequent agreement',
    'attorney fees to enforce or modify agreement',
    'cooperation in implementation',
    'effective date',
    'court action',
    'severability',
    'additional terms & conditions',
    'future children',
    'parenting visitation',
    'physical custody',
    'notice of change of residence',
    'previous court actions',
    'additional support',
    'deferred',
    'dependents',
  ],

  docToHtml: async (fileName, currentUserId) => {
    const myHeaders = new Headers()
    myHeaders.append('Access-Control-Allow-Origin', '*')
    // let apiAddress = 'https://localhost:5000'
    let apiAddress = 'https://peaceful-coparenting.app:5000'
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      crossOrigin: true,
      redirect: 'follow',
    }

    let returnHtml = ''
    const all = await FirebaseStorage.getImageAndUrl(FirebaseStorage.directories.documents, currentUserId, fileName)
    const {status, imageUrl} = all
    if (status === 'success') {
      await fetch(`${apiAddress}/document/getDocText?fileName=${fileName}&currentUserId=${currentUserId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => (returnHtml = result))
        .catch((error) => console.error(error))
    }
    return returnHtml
  },
  pdfToHtml: async (fileName, currentUserId) => {
    const myHeaders = new Headers()
    myHeaders.append('Access-Control-Allow-Origin', '*')
    let apiAddress = 'https://localhost:5000'
    // let apiAddress = 'https://peaceful-coparenting.app:5000'
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      crossOrigin: true,
      redirect: 'follow',
    }

    let returnHtml = ''
    const all = await FirebaseStorage.getImageAndUrl(FirebaseStorage.directories.documents, currentUserId, fileName)
    const {status, imageUrl} = all
    if (status === 'success') {
      await fetch(`${apiAddress}/document/getTextFromPdf?fileName=${fileName}&currentUserId=${currentUserId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => (returnHtml = result))
        .catch((error) => console.error(error))
    }
    return returnHtml
  },
  imageToHtml: async (url, fileName) => {
    let returnHtml = ''
    const extension = StringManager.getFileExtension(fileName)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'image/*')
    let shortenedUrl = await ImageManager.shortenUrl(url)

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    }

    try {
      // REACT_APP_OCR_API_KEY
      const response = await fetch(
        // eslint-disable-next-line no-undef
        `https://api.ocr.space/parse/imageurl?apikey=${process.env.REACT_APP_OCR_API_KEY}&url=${shortenedUrl}&OCREngine=2&filetype=${extension}`,
        requestOptions
      ).catch((error) => {
        AlertManager.throwError('Unable to parse image. Please try again after a few minutes.')
        console.log(error)
        return false
      })
      const result = await response.json()
      returnHtml = result
    } catch (error) {
      AlertManager.throwError('Unable to parse image. Please try again after a few minutes.')
      console.error(error)
    }

    return returnHtml
  },
}

export default DocumentConversionManager