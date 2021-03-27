import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { chunk } from 'lodash'
import React, { useState, useMemo } from 'react'
import { PaginationProps, Pagination as PaginationUI } from 'semantic-ui-react'

const paginations = [100, 1000, 10000, 100000]

type Props<T> = {
  items: T[]
  Component: (props: { items: T[] }) => JSX.Element
}

/** Provides a pagination to a given component. Page size can be changed. */
const Pagination = <T extends unknown>({ items, Component }: Props<T>) => {
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(paginations[0])

  const handlePaginationChange = (_: unknown, { activePage }: PaginationProps) => setPage(Number(activePage))

  const paginated = useMemo(() => chunk(items, pagination), [items, pagination])
  const shownItems = paginated[page - 1] ?? []

  return (
    <>
      <div>
        <PaginationUI activePage={page} totalPages={paginated.length} onPageChange={handlePaginationChange} />
        <SimpleDropdown
          style={{ height: 42, marginLeft: '1rem', width: 80 }}
          values={paginations}
          value={pagination}
          onChange={setPagination}
        />
      </div>
      <Component items={shownItems} />
    </>
  )
}

export default Pagination
