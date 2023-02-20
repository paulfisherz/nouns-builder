import { Provider } from '@ethersproject/abstract-provider'
import { FOUNDER_ALLOCATION, CONTRIBUTION_ALLOCATION } from 'src/components/Fields/types'
import { isValidAddress } from 'src/utils/ens'
import { getProvider } from 'src/utils/provider'
import * as Yup from 'yup'

const allocationSchema = Yup.object().shape({
  founderAddress: Yup.string()
    .test(
      'isValidAddress',
      'invalid address',
      (value: string | undefined) => !!value && isValidAddress(value, getProvider())
    )
    .required('*'),
  allocation: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .min(0, '>= 0') // (condition, errorMessage) - allocation represented as % must be greater than or equal to 0
    .max(100, '< 100')
    .integer('Must be whole number'),
  endDate: Yup.string()
    .required('*')
    .test('isDateInFuture', 'Must be in future', (value: string | undefined) => {
      if (!value) return false
      const date = new Date(value)
      const now = new Date()
      return date > now
    }),
})

export const validationSchemaContributions = Yup.object().shape({
  contributionAllocation: Yup.array().of(allocationSchema),
  // .test(
  //   'totalAllocation',
  //   'sum of all allocations must be < 100%',
  //   function (value, context) {
  //     const allocations = [
  //       // @ts-ignore
  //       ...context.options.parent.founderAllocation,
  //       // @ts-ignore
  //       ...context.options.parent.contributionAllocation,
  //     ]

  //     const allocationPercentage = allocations.reduce(
  //       (acc, cv) => acc + (cv?.allocation || 0),
  //       0
  //     )

  //     return (
  //       (!!allocationPercentage || allocationPercentage === 0) &&
  //       allocationPercentage <= 100
  //     )
  //   }
  // ),
})

export const validateFounder = (signerAddress: string | null) =>
  Yup.object().shape({
    founderAllocation: Yup.array()
      .of(allocationSchema)
      .min(1, 'founder required')
      .test(
        'founderAddress',
        'the founder must be the connected wallet.',
        function (value) {
          if (value?.[0]) {
            return value?.[0]['founderAddress'] === signerAddress
          }
          return false
        }
      ),
  })
