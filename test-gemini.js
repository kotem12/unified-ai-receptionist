const { GoogleGenerativeAI } =
  require('@google/generative-ai')

const apiKey =
  'YOUR_GEMINI_KEY'

const genAI =
  new GoogleGenerativeAI(apiKey)

async function run() {
  try {
    const model =
      genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      })

    const result =
      await model.generateContent(
        'Say hello'
      )

    console.log(
      result.response.text()
    )

  } catch (err) {

    console.error('FULL ERROR:')
    console.error(err)

    if (err.cause) {
      console.error('\nCAUSE:')
      console.error(err.cause)
    }
  }
}

run()