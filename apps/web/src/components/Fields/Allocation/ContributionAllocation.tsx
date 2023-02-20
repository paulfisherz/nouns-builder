import React, { ChangeEventHandler, ReactElement, ReactNode, useState } from 'react'
import { Button, Heading, Flex, Box, Stack, Text } from '@zoralabs/zord'
import { Form, Formik, FormikProps, FieldArray } from 'formik'
import { useFormStore } from 'src/stores'
import { formatDate, yearsAhead } from 'src/utils/helpers'
import { PUBLIC_NOUNS_ADDRESS, PUBLIC_BUILDER_ADDRESS } from 'src/constants/addresses'
import Image from 'next/image'
import CopyButton from 'src/components/CopyButton/CopyButton'
import { useEnsData } from 'src/hooks/useEnsData'
import { AddressType, allocationProps } from 'src/typings'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { validationSchemaContributions } from '../fields/founder'
import SmartInput from '../SmartInput'
import Date from '../Date'
import { getEnsAddress } from 'src/utils/ens'
import { allocationToggle, allocationToggleButtonVariants } from '../styles.css'

interface ContributionAllocationFormProps {
  inputLabel: string | ReactElement
  formik?: FormikProps<any>
  errorMessage?: any
  autoSubmit?: boolean
  helperText?: string
  onBlur: ChangeEventHandler
  submitCallback?: (values: any) => void
  onChange: ChangeEventHandler
}

export const DaoCopyAddress = ({
  image,
  name,
  ens,
  address,
}: {
  image: string
  name?: string
  ens: string
  address: AddressType
}) => (
  <Flex gap={'x3'} style={{ width: '50%' }} align={'center'}>
    <Box width={'x13'} height={'x13'}>
      <Image
        src={image}
        alt={`${name} icon`}
        height={52}
        width={52}
        style={{ borderRadius: '50%' }}
      />
    </Box>

    <Flex direction={'column'}>
      {name && <Text fontWeight={'display'}>{name}</Text>}
      <Flex direction={'row'} align={'center'}>
        <Text>{ens}</Text>
        <CopyButton text={address} />
      </Flex>
    </Flex>
  </Flex>
)

const Contribution = ({
  address,
  allocation,
  endDate,
}: {
  address: ReactNode
  allocation: string
  endDate: string
}) => (
  <Flex direction={'row'} py={'x4'}>
    {address}
    <Flex align={'center'} style={{ width: '25%' }}>
      <Text>{allocation}%</Text>
    </Flex>
    <Flex align={'center'} style={{ width: '25%' }}>
      <Text>{formatDate(endDate, true)}</Text>
    </Flex>
  </Flex>
)

const ContributionFields = ({
  title,
  address,
  index,
  formik,
  allocation,
  endDate,
}: {
  title: string
  address: ReactNode
  index: number
  formik: any
  allocation: string
  endDate: string
}) => (
  <Box mt={'x4'}>
    <Text fontWeight={'display'}>{title}</Text>
    <Flex direction={'row'} mt={'x4'}>
      {address}

      <SmartInput
        inputLabel={'Percentage'}
        id={`contributionAllocation.${index}.allocation`}
        value={allocation}
        type={'number'}
        formik={formik}
        disabled={true}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        perma={'%'}
        autoSubmit={false}
        isAddress={false}
      />

      <Date
        id={`contributionAllocation.${index}.endDate`}
        value={endDate}
        inputLabel={'End date'}
        formik={formik}
        autoSubmit={false}
        disabled
        errorMessage={''}
      />
    </Flex>
  </Box>
)

const ContributionAllocationNew = () => {
  const [open, setOpen] = useState(false)
  const contributionAllocation = useFormStore((state) => state.contributionAllocation)
  const setContributionAllocation = useFormStore(
    (state) => state.setContributionAllocation
  )

  const { displayName: builderDisplayName } = useEnsData(PUBLIC_BUILDER_ADDRESS)
  const { displayName: nounsDisplayName } = useEnsData(PUBLIC_NOUNS_ADDRESS)

  const builderAllocationValue = contributionAllocation[0]
  const nounsAllocationValue = contributionAllocation[1] ?? undefined

  const handleSubmit = async ({
    contributionAllocation,
  }: {
    contributionAllocation: allocationProps[]
  }) => {
    const contributionAllocationPromises = contributionAllocation.map((allocation) =>
      getEnsAddress(allocation.founderAddress)
    )

    const contributionAllocationAddresses = await Promise.all(
      contributionAllocationPromises
    )

    setContributionAllocation(
      contributionAllocation.map((allocation, idx) => ({
        ...allocation,
        founderAddress: contributionAllocationAddresses[idx],
      }))
    )

    setOpen(false)
  }

  return (
    <>
      <Stack>
        <Flex direction={'column'}>
          <Heading size="xs" mt={'x8'} mb={'x6'}>
            Contributions
          </Heading>
        </Flex>
        <Flex
          direction={'column'}
          pt={'x4'}
          px={'x6'}
          borderWidth={'normal'}
          borderStyle={'solid'}
          borderColor={'border'}
          borderRadius={'curved'}
        >
          <Flex direction={'row'}>
            <Text fontWeight={'display'} style={{ width: '50%' }}>
              Address
            </Text>
            <Text fontWeight={'display'} style={{ width: '25%' }}>
              Percentage
            </Text>
            <Text fontWeight={'display'} style={{ width: '25%' }}>
              Date
            </Text>
          </Flex>

          <Contribution
            allocation={builderAllocationValue?.allocation}
            endDate={builderAllocationValue?.endDate}
            address={
              <DaoCopyAddress
                name="Builder"
                image="/builder-avatar-circle.png"
                ens={builderDisplayName}
                address={PUBLIC_BUILDER_ADDRESS}
              />
            }
          />

          {nounsAllocationValue && (
            <Contribution
              allocation={nounsAllocationValue?.allocation}
              endDate={nounsAllocationValue?.endDate}
              address={
                <DaoCopyAddress
                  name="Nouns"
                  image="/nouns-avatar-circle.png"
                  ens={nounsDisplayName}
                  address={PUBLIC_NOUNS_ADDRESS}
                />
              }
            />
          )}
        </Flex>

        <Flex align={'center'} justify={'center'}>
          <Button mt={'x2'} type="button" variant="ghost" onClick={() => setOpen(true)}>
            Change Contributions
          </Button>
        </Flex>
      </Stack>

      <AnimatedModal open={open} size={'auto'} close={() => setOpen(false)}>
        <Formik
          initialValues={{ contributionAllocation: contributionAllocation || [] }}
          enableReinitialize
          validateOnBlur={false}
          validateOnMount={true}
          validateOnChange={true}
          validationSchema={validationSchemaContributions}
          onSubmit={handleSubmit}
        >
          {(formik) => (
            <Form>
              <FieldArray name="contributionAllocation">
                {({ remove, push }) => (
                  <Stack>
                    <Text fontSize={28} fontWeight={'display'} mb={'x4'}>
                      Change Contributions
                    </Text>

                    <Box mt={'x4'}>
                      <Text fontWeight={'display'}>Builder Contribution</Text>
                      <Flex direction={'row'} mt={'x4'}>
                        <DaoCopyAddress
                          name="Builder"
                          image="/builder-avatar-circle.png"
                          ens={builderDisplayName}
                          address={PUBLIC_BUILDER_ADDRESS}
                        />

                        <SmartInput
                          inputLabel={'Percentage'}
                          id={`contributionAllocation.0.allocation`}
                          value={contributionAllocation[0].allocation}
                          type={'number'}
                          formik={formik}
                          disabled={true}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          perma={'%'}
                          autoSubmit={false}
                          isAddress={false}
                        />

                        <Date
                          id={`contributionAllocation.0.endDate`}
                          value={contributionAllocation[0].endDate}
                          inputLabel={'End date'}
                          formik={formik}
                          autoSubmit={false}
                          disabled
                          errorMessage={''}
                        />
                      </Flex>
                    </Box>

                    <Box
                      h={'x0'}
                      borderStyle={'solid'}
                      borderColor={'border'}
                      borderWidth={'thin'}
                      my={'x4'}
                    />

                    <Box mb={'x8'}>
                      <Flex justify={'space-between'}>
                        <Text fontWeight={'display'}>Nouns Contribution</Text>

                        <Flex
                          className={
                            allocationToggle[
                              formik.values.contributionAllocation?.[1] ? 'on' : 'off'
                            ]
                          }
                          onClick={() => {
                            if (formik.values.contributionAllocation?.[1]) {
                              remove(1)
                              return
                            }

                            push({
                              founderAddress: PUBLIC_NOUNS_ADDRESS,
                              allocation: 1,
                              endDate: yearsAhead(5),
                            })
                          }}
                        >
                          <Flex
                            h={'x6'}
                            w={'x6'}
                            borderRadius={'round'}
                            className={
                              allocationToggleButtonVariants[
                                formik.values.contributionAllocation?.[1] ? 'on' : 'off'
                              ]
                            }
                            align={'center'}
                            justify={'center'}
                          >
                            <img src={'/handlebar.png'} alt="toggle-button" />
                          </Flex>
                        </Flex>
                      </Flex>

                      {formik.values.contributionAllocation?.[1] && (
                        <Flex direction={'row'} mt={'x4'}>
                          <DaoCopyAddress
                            name="Nouns"
                            image="/nouns-avatar-circle.png"
                            ens={nounsDisplayName}
                            address={PUBLIC_NOUNS_ADDRESS}
                          />

                          <SmartInput
                            inputLabel={'Percentage'}
                            id={`contributionAllocation.1.allocation`}
                            value={formik.values.contributionAllocation[1].allocation}
                            type={'number'}
                            formik={formik}
                            disabled={false}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            perma={'%'}
                            autoSubmit={false}
                            isAddress={false}
                          />

                          <Date
                            id={`contributionAllocation.1.endDate`}
                            value={formik.values.contributionAllocation[1].endDate}
                            inputLabel={'End date'}
                            formik={formik}
                            autoSubmit={false}
                            disabled={false}
                            errorMessage={''}
                          />
                        </Flex>
                      )}
                    </Box>
                  </Stack>
                )}
              </FieldArray>

              <Button borderRadius="curved" type="submit" width={'100%'}>
                Save and Exit
              </Button>
            </Form>
          )}
        </Formik>
      </AnimatedModal>
    </>
  )
}

export default ContributionAllocationNew
