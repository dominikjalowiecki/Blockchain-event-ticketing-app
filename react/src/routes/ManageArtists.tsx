import { useState, useEffect, useCallback } from "react"
import type { RefObject } from "react"
import type { Toast } from "primereact/toast"
import { useOutletContext, Link } from "react-router-dom"
import { generateIdString } from "~/utils"
import client from "~/utils/client"
import { Button } from "primereact/button"
import CreateArtistDialog from "~/components/artist/CreateArtistDialog"
import EditArtistDialog from "~/components/artist/EditArtistDialog"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Toolbar } from "primereact/toolbar"
import type { Paths } from "~/utils/types/openapi.d.ts"
import { IconField } from "primereact/iconfield"
import { InputIcon } from "primereact/inputicon"

function ManageArtists() {
  const { toast } = useOutletContext<{ toast: RefObject<Toast> }>()

  const [createArtistVisible, setCreateArtistVisible] = useState(false)
  const [editArtistVisible, setEditArtistVisible] = useState(false)

  const [artists, setArtists] = useState<Paths.ListArtists.Responses.$200 | null>(null)
  const [selectedIdArtist, setSelectedIdArtist] = useState<number | null>(null)

  const editArtistButtonTemplate = useCallback(
    (artist: any) => (
      <>
        <Button
          label="Edytuj"
          severity="danger"
          size="small"
          icon="pi pi-external-link"
          onClick={() => {
            setSelectedIdArtist(artist.idArtist)
            setEditArtistVisible(true)
          }}
          className="mr-2"
        />
        <Link to={`/artists/${generateIdString(artist.name, artist.idArtist)}`}>
          <Button label="Przejdź do strony" severity="info" size="small" icon="pi pi-link" link />
        </Link>
      </>
    ),
    []
  )

  const [search, setSearch] = useState<string>("")

  const [filters, setFilters] = useState<object>({})

  const [loading, setLoading] = useState<boolean>(false)

  const [rowsPerPage] = useState(3)
  const [page, setPage] = useState(1)

  const handleListArtists = useCallback(async () => {
    setLoading(true)
    setArtists(null)
    const result = await client.ListArtists({
      search: search !== "" ? search : undefined,
      page,
    })
    setArtists(result.data)
    setLoading(false)
  }, [search, page])

  useEffect(() => {
    if (artists) {
      setPage(artists.currentPage)
    }
  }, [artists])

  const filter = () => {
    setPage(1)
    setFilters({})
  }

  const resetFilters = () => {
    setSearch("")
    setPage(1)
    setFilters({})
  }

  useEffect(() => {
    handleListArtists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const startContent = (
    <Button
      icon="pi pi-plus"
      aria-label="Utwórz"
      onClick={() => {
        setCreateArtistVisible(true)
      }}
    />
  )

  const centerContent = (
    <IconField iconPosition="left" className="w-full md:w-14rem md:mr-2 mb-2 md:m-0">
      <InputIcon className="pi pi-search" aria-label="Szukaj" />
      <InputText
        id="search"
        type="search"
        placeholder="Szukaj"
        className="w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </IconField>
  )

  const endContent = (
    <>
      <Button
        label="Filtruj"
        size="small"
        icon="pi pi-search"
        severity="warning"
        className="mr-2"
        onClick={filter}
        disabled={loading}
      />
      <Button
        label="Resetuj"
        size="small"
        icon="pi pi-times"
        severity="secondary"
        onClick={resetFilters}
        disabled={loading}
      />
    </>
  )

  const onPage = useCallback((event: any) => {
    setPage(event.first / 3 + 1)
    setFilters({})
  }, [])

  return (
    <>
      <h2 className="mt-0">Artyści</h2>
      <div className="mb-5">
        <Toolbar start={startContent} center={centerContent} end={endContent} />
      </div>
      <DataTable
        value={artists?.results}
        paginator
        rows={rowsPerPage}
        first={(page - 1) * rowsPerPage}
        totalRecords={artists?.count}
        onPage={onPage}
        tableStyle={{ minWidth: "50rem" }}
        loading={loading}
        lazy
        emptyMessage="Nie znaleziono artystów"
      >
        <Column field="name" header="Nazwa"></Column>
        <Column header="Opcje" body={editArtistButtonTemplate}></Column>
      </DataTable>
      <CreateArtistDialog
        revalidate={handleListArtists}
        toast={toast}
        header="Utwórz artystę"
        visible={createArtistVisible}
        style={{ width: "100%", maxWidth: "800px" }}
        className="m-3"
        onHide={() => setCreateArtistVisible(false)}
        draggable={false}
      />
      <EditArtistDialog
        revalidate={handleListArtists}
        toast={toast}
        idArtist={selectedIdArtist}
        header="Edytuj artystę"
        visible={editArtistVisible}
        style={{ width: "100%", maxWidth: "800px" }}
        className="m-3"
        onHide={() => setEditArtistVisible(false)}
        draggable={false}
      />
    </>
  )
}

export default ManageArtists
