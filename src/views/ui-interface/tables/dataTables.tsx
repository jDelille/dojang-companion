import { useState } from "react";
import Datatable from "../../../components/data-table";
import type { DatatableColumns } from "../../../core/data/interface";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/data-tables.html. The template wires a static table to
   simple-datatables (search/length/page/info slots); the shared Datatable already
   owns search, filtering, sorting, column toggles and paging.
*/

type Employee = {
  key: string;
  name: string;
  position: string;
  office: string;
  age: number;
  start: string;
  salary: string;
};

const EMPLOYEES: Employee[] = [
  { key: "1", name: "Tiger Nixon", position: "System Architect", office: "Edinburgh", age: 61, start: "2011 Apr 25", salary: "$320,800" },
  { key: "2", name: "Garrett Winters", position: "Accountant", office: "Tokyo", age: 63, start: "2011 Jul 25", salary: "$170,750" },
  { key: "3", name: "Ashton Cox", position: "Junior Technical Author", office: "San Francisco", age: 66, start: "2009 Jan 12", salary: "$86,000" },
  { key: "4", name: "Cedric Kelly", position: "Senior Javascript Developer", office: "Senior Javascript Developer", age: 22, start: "2012 Mar 29", salary: "$433,060" },
  { key: "5", name: "Airi Satou", position: "Accountant", office: "Tokyo", age: 33, start: "2008 Nov 28", salary: "$162,700" },
  { key: "6", name: "Brielle Williamson", position: "Integration Specialist", office: "New York", age: 61, start: "2012 Dec 02", salary: "$372,000" },
  { key: "7", name: "Herrod Chandler", position: "Sales Assistant", office: "San Francisco", age: 59, start: "2012 Aug 06", salary: "$137,500" },
  { key: "8", name: "Rhona Davidson", position: "Integration Specialist", office: "Tokyo", age: 55, start: "2010 Oct 14", salary: "$327,900" },
  { key: "9", name: "Colleen Hurst", position: "Javascript Developer", office: "San Francisco", age: 39, start: "2009 Sep 15", salary: "$205,500" },
  { key: "10", name: "Sonya Frost", position: "Software Engineer", office: "Edinburgh", age: 23, start: "2008 Dec 13", salary: "$103,600" },
  { key: "11", name: "Jena Gaines", position: "Office Manager", office: "London", age: 30, start: "2008 Dec 19", salary: "$90,560" },
  { key: "12", name: "Quinn Flynn", position: "Support Lead", office: "Edinburgh", age: 22, start: "2013 Mar 03", salary: "$342,000" },
  { key: "13", name: "Charde Marshall", position: "Regional Director", office: "San Francisco", age: 36, start: "2008 Oct 16", salary: "$470,600" },
  { key: "14", name: "Haley Kennedy", position: "Senior Marketing Designer", office: "London", age: 43, start: "2012 Dec 18", salary: "$313,500" },
  { key: "15", name: "Tatyana Fitzpatrick", position: "Regional Director", office: "London", age: 19, start: "2010 Mar 17", salary: "$385,750" },
  { key: "16", name: "Michael Silva", position: "Marketing Designer", office: "London", age: 66, start: "2012 Nov 27", salary: "$198,500" },
  { key: "17", name: "Paul Byrd", position: "Chief Financial Officer (CFO)", office: "New York", age: 64, start: "2010 Jun 09", salary: "$725,000" },
  { key: "18", name: "Gloria Little", position: "Systems Administrator", office: "New York", age: 59, start: "2009 Apr 10", salary: "$237,500" },
  { key: "19", name: "Bradley Greer", position: "Software Engineer", office: "London", age: 41, start: "2012 Oct 13", salary: "$132,000" },
  { key: "20", name: "Dai Rios", position: "Personnel Lead", office: "Edinburgh", age: 35, start: "2012 Sep 26", salary: "$217,500" },
  { key: "21", name: "Jenette Caldwell", position: "Development Lead", office: "New York", age: 30, start: "2011 Sep 03", salary: "$345,000" },
  { key: "22", name: "Yuri Berry", position: "Chief Marketing Officer (CMO)", office: "New York", age: 40, start: "2009 Jun 25", salary: "$675,000" },
  { key: "23", name: "Caesar Vance", position: "Pre-Sales Support", office: "New York", age: 21, start: "2011 Dec 12", salary: "$106,450" },
  { key: "24", name: "Doris Wilder", position: "Sales Assistant", office: "Sidney", age: 23, start: "2010 Sep 20", salary: "$85,600" },
  { key: "25", name: "Angelica Ramos", position: "Chief Executive Officer (CEO)", office: "London", age: 47, start: "2009 Oct 09", salary: "$1,200,000" },
  { key: "26", name: "Gavin Joyce", position: "Developer", office: "Edinburgh", age: 42, start: "2010 Dec 22", salary: "$92,575" },
  { key: "27", name: "Jennifer Chang", position: "Regional Director", office: "Singapore", age: 28, start: "2010 Nov 14", salary: "$357,650" },
  { key: "28", name: "Brenden Wagner", position: "Software Engineer", office: "San Francisco", age: 28, start: "2011 Jun 07", salary: "$206,850" },
  { key: "29", name: "Fiona Green", position: "Chief Operating Officer (COO)", office: "San Francisco", age: 48, start: "2010 Mar 11", salary: "$850,000" },
  { key: "30", name: "Shou Itou", position: "Regional Marketing", office: "Tokyo", age: 20, start: "2011 Aug 14", salary: "$163,000" },
];

const COLUMNS: DatatableColumns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Position", dataIndex: "position", key: "position" },
  { title: "Office", dataIndex: "office", key: "office" },
  { title: "Age", dataIndex: "age", key: "age" },
  { title: "Start date", dataIndex: "start", key: "start" },
  { title: "Salary", dataIndex: "salary", key: "salary" },
];

const DATA_TABLE_CODE = `<div class="pb-3 flex items-center justify-between gap-3 flex-wrap">
	<h3 class="text-[17.5px]">Data List</h3>
	<input type="search" placeholder="Search…" class="fp-input h-8 w-56 text-[calc(12px*var(--fs))]" aria-label="Search records">
</div>
<div class="preview-content overflow-auto">
	<table class="table-auto mb-0 w-full">
		<thead>
			<tr>
				<th>Name</th>
				<th>Position</th>
				<th>Office</th>
				<th>Age</th>
				<th>Start date</th>
				<th>Salary</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Tiger Nixon</td>
				<td>System Architect</td>
				<td>Edinburgh</td>
				<td>61</td>
				<td>2011 Apr 25</td>
				<td>$320,800</td>
			</tr>
			<!-- remaining employee rows follow the same pattern -->
		</tbody>
	</table>
</div>`;

const DataTables = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Data Tables</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1">
        <PreviewCodeToggle
          title="Data Table"
          code={DATA_TABLE_CODE}
          cardShellClassName="preview-card glass-card p-5 pb-0"
          contentClassName="overflow-auto"
        >
          <div className="pb-3 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-[17.5px]">Data List</h3>
          </div>

          <Datatable
            columns={COLUMNS}
            dataSource={EMPLOYEES}
            searchText={searchText}
            filterColumns={["office", "position"]}
            sortColumn="name"
            toolbarLeft={
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search…"
                className="fp-input h-8 w-56 text-[calc(12px*var(--fs))]"
                aria-label="Search records"
              />
            }
          />
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default DataTables;
